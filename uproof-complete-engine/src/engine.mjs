import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const model = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/model.json"), "utf8"));
const inputCatalog = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/inputs.json"), "utf8"));
const inputSchema = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/input-schema.json"), "utf8"));
const unusedWorkbookFields = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/unused-workbook-fields.json"), "utf8"));
const outputAssets = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/output-assets.json"), "utf8"));
const sheetRoles = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/sheet-roles.json"), "utf8"));

class ExcelError extends Error {
  constructor(code) { super(code); this.code = code; }
  toJSON() { return this.code; }
  toString() { return this.code; }
}
const ERR = (code) => new ExcelError(code);
const isErr = (v) => v instanceof ExcelError;
const isBlank = (v) => v === null || v === undefined || v === "";

function colToNum(col) {
  let n = 0;
  for (const ch of col.toUpperCase()) n = n * 26 + ch.charCodeAt(0) - 64;
  return n;
}
function numToCol(n) {
  let s = "";
  while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); }
  return s;
}
function parseA1(a1) {
  const m = /^([A-Z]+)(\d+)$/i.exec(a1);
  if (!m) throw new Error(`Invalid A1 address: ${a1}`);
  return { col: colToNum(m[1]), row: Number(m[2]) };
}
function toNumber(v) {
  if (isErr(v)) throw v;
  if (isBlank(v)) return 0;
  if (typeof v === "boolean") return v ? 1 : 0;
  if (typeof v === "number") return v;
  const n = Number(v);
  if (Number.isFinite(n)) return n;
  throw ERR("#VALUE!");
}
function truthy(v) {
  if (isErr(v)) throw v;
  if (isBlank(v)) return false;
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  return String(v).length > 0;
}
function flatten(v) {
  if (Array.isArray(v)) return v.flat(Infinity);
  return [v];
}
function roundUpExcel(value, digits = 0) {
  const n = toNumber(value), d = toNumber(digits);
  const p = 10 ** d;
  return n >= 0 ? Math.ceil(n * p - 1e-12) / p : Math.floor(n * p + 1e-12) / p;
}
function compareValues(a, b, op) {
  if (isErr(a)) throw a; if (isErr(b)) throw b;
  const bothNumberish = (typeof a === "number" || isBlank(a)) && (typeof b === "number" || isBlank(b));
  const x = bothNumberish ? toNumber(a) : (isBlank(a) ? "" : a);
  const y = bothNumberish ? toNumber(b) : (isBlank(b) ? "" : b);
  switch (op) {
    case "=": return x === y;
    case "<>": return x !== y;
    case "<": return x < y;
    case ">": return x > y;
    case "<=": return x <= y;
    case ">=": return x >= y;
    default: throw new Error(`Unknown comparison ${op}`);
  }
}
function jsonValue(v) { return isErr(v) ? v.code : v; }


function slugKey(value) {
  return String(value ?? "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]+(.)/g, (_, c) => c ? c.toUpperCase() : "")
    .replace(/^[A-Z]/, c => c.toLowerCase()) || "value";
}

function normalizeText(value) {
  return String(value ?? "").trim().toLowerCase();
}

const SERVICE_PATTERNS = [
  /nocel/, /uzcel/, /utiliz/, /izvešan/, /pakalpojum/, /noma\b/, /piegād/,
  /būvdarbu vad/, /apdrošin/, /naktsmītn/, /komandējum/, /bio tualet/,
  /konteiner/, /autocelt/, /celtniecības lift/, /gājēju tunel/, /sastatnes montāž/,
  /sastatnes demontāž/, /transporta izdev/, /arborist/, /speciālist/
];

function costItemKind(description) {
  const text = normalizeText(description);
  if (SERVICE_PATTERNS.some(re => re.test(text))) return "serviceOrRental";
  return "physicalMaterial";
}

function safeNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export class UpRoofEngine {
  constructor() {
    this.overrides = new Map();
    this.cache = new Map();
    this.spill = new Map();
    this.dynamicReady = false;
    this.inputByKey = new Map();
    for (const item of inputCatalog) this.inputByKey.set(item.key, item);
    for (const item of inputSchema) {
      this.inputByKey.set(item.key, item);
      if (item.legacyKey) this.inputByKey.set(item.legacyKey, item);
    }
  }

  invalidate() {
    this.cache.clear();
    this.spill.clear();
    this.dynamicReady = false;
  }

  setInputCell(a1, value) {
    this.overrides.set(`Ievade!${a1}`, value);
    this.invalidate();
    return this;
  }

  setInput(key, value) {
    const def = this.inputByKey.get(key);
    if (!def) throw new Error(`Unknown input key: ${key}`);
    return this.setInputCell(def.cell, value);
  }

  setInputs(values = {}) {
    for (const [key, value] of Object.entries(values)) this.setInput(key, value);
    return this;
  }

  setInputCells(values = {}) {
    for (const [a1, value] of Object.entries(values)) this.setInputCell(a1, value);
    return this;
  }

  getInputCatalog() { return structuredClone(inputSchema); }

  getLegacyInputCatalog() { return structuredClone(inputCatalog); }

  getUnusedWorkbookFields() { return structuredClone(unusedWorkbookFields); }

  getInputValues() {
    const out = {};
    for (const d of inputSchema) out[d.key] = jsonValue(this.get("Ievade", d.cell, false));
    return out;
  }

  getInputValuesBySection() {
    const groups = {};
    for (const d of inputSchema) {
      if (!groups[d.group]) groups[d.group] = { section: d.section, inputs: {} };
      groups[d.group].inputs[d.key] = {
        value: jsonValue(this.get("Ievade", d.cell, false)),
        cell: d.cell,
        label: d.label,
        unit: d.unit,
        field: d.field,
        advanced: d.advanced,
      };
    }
    return groups;
  }

  get(sheet, a1, allowDynamic = true) {
    if (allowDynamic && ["Darbu plāns", "Dienas plāns", "Mehānismu saraksts"].includes(sheet)) this.ensureDynamic();
    const key = `${sheet}!${a1}`;
    if (this.overrides.has(key)) return this.overrides.get(key);
    if (this.spill.has(key)) return this.spill.get(key);
    if (this.cache.has(key)) return this.cache.get(key);
    const s = model.sheets[sheet];
    if (!s) return ERR("#REF!");
    if (Object.prototype.hasOwnProperty.call(s.literals, a1)) return s.literals[a1];
    const ast = s.formulas[a1];
    if (!ast) return null;

    // Dynamic-array anchors are implemented natively in ensureDynamic().
    if (ast[0] === "dummy") {
      return this.spill.get(key) ?? null;
    }

    // optimistic cycle guard
    this.cache.set(key, ERR("#CYCLE!"));
    let value;
    try { value = this.evalAst(ast, sheet); }
    catch (e) { value = e instanceof ExcelError ? e : ERR("#VALUE!"); }
    this.cache.set(key, value);
    return value;
  }

  range(sheet, a1, a2) {
    const p1 = parseA1(a1), p2 = parseA1(a2);
    const rows = [];
    for (let r = Math.min(p1.row,p2.row); r <= Math.max(p1.row,p2.row); r++) {
      const row = [];
      for (let c = Math.min(p1.col,p2.col); c <= Math.max(p1.col,p2.col); c++) {
        row.push(this.get(sheet, `${numToCol(c)}${r}`, false));
      }
      rows.push(row);
    }
    return rows;
  }

  evalAst(ast, currentSheet) {
    const kind = ast[0];
    if (kind === "n" || kind === "s" || kind === "b") return ast[1];
    if (kind === "err") throw ERR(ast[1]);
    if (kind === "r") return this.get(ast[1] ?? currentSheet, ast[2], false);
    if (kind === "g") {
      const s1 = ast[1] ?? currentSheet;
      const s2 = ast[3] ?? s1;
      if (s1 !== s2) throw ERR("#REF!");
      return this.range(s1, ast[2], ast[4]);
    }
    if (kind === "un") {
      const v = toNumber(this.evalAst(ast[2], currentSheet));
      return ast[1] === "-" ? -v : v;
    }
    if (kind === "pct") return toNumber(this.evalAst(ast[1], currentSheet)) / 100;
    if (kind === "op") {
      const op = ast[1];
      if (["=","<>","<",">","<=",">="].includes(op))
        return compareValues(this.evalAst(ast[2], currentSheet), this.evalAst(ast[3], currentSheet), op);
      const a = toNumber(this.evalAst(ast[2], currentSheet));
      const b = toNumber(this.evalAst(ast[3], currentSheet));
      if (op === "+") return a + b;
      if (op === "-") return a - b;
      if (op === "*") return a * b;
      if (op === "/") { if (b === 0) throw ERR("#DIV/0!"); return a / b; }
      throw new Error(`Unknown operator ${op}`);
    }
    if (kind === "name") {
      if (ast[1].toUpperCase() === "TRUE") return true;
      if (ast[1].toUpperCase() === "FALSE") return false;
      throw ERR("#NAME?");
    }
    if (kind === "f") {
      const name = ast[1], args = ast[2];
      if (name === "IF") {
        const cond = this.evalAst(args[0], currentSheet);
        return truthy(cond) ? this.evalAst(args[1], currentSheet) : (args[2] ? this.evalAst(args[2], currentSheet) : false);
      }
      if (name === "IFERROR") {
        try {
          const value = this.evalAst(args[0], currentSheet);
          return isErr(value) ? this.evalAst(args[1], currentSheet) : value;
        } catch {
          return this.evalAst(args[1], currentSheet);
        }
      }
      const vals = args.map(a => this.evalAst(a, currentSheet));
      if (name === "SUM") {
        let sum = 0;
        for (const v of flatten(vals)) {
          if (isErr(v)) throw v;
          if (typeof v === "number") sum += v;
          else if (typeof v === "boolean") sum += v ? 1 : 0;
        }
        return sum;
      }
      if (name === "ROUNDUP") return roundUpExcel(vals[0], vals[1] ?? 0);
      if (name === "COUNT") return flatten(vals).filter(v => typeof v === "number" && Number.isFinite(v)).length;
      if (name === "MATCH") {
        const lookup = vals[0], arr = flatten(vals[1]);
        const idx = arr.findIndex(v => !isErr(v) && v === lookup);
        if (idx < 0) throw ERR("#N/A");
        return idx + 1;
      }
      if (name === "INDEX") {
        const matrix = Array.isArray(vals[0]) ? vals[0] : [[vals[0]]];
        const row = Math.trunc(toNumber(vals[1])) - 1;
        const col = vals.length > 2 ? Math.trunc(toNumber(vals[2])) - 1 : 0;
        if (row < 0 || col < 0 || !matrix[row] || matrix[row][col] === undefined) throw ERR("#REF!");
        return matrix[row][col];
      }
      if (name === "UNIQUE") {
        const seen = new Set(), result = [];
        for (const v of flatten(vals[0])) {
          if (isBlank(v) || isErr(v)) continue;
          const k = `${typeof v}:${String(v)}`;
          if (!seen.has(k)) { seen.add(k); result.push(v); }
        }
        return result;
      }
      if (name === "TOCOL") return flatten(vals[0]).filter(v => !(vals[1] === 1 && isBlank(v)));
      if (name === "TEXTJOIN") {
        const delim = String(vals[0] ?? ""), ignoreEmpty = truthy(vals[2]);
        const items = flatten(vals.slice(3)).filter(v => !(ignoreEmpty && isBlank(v))).map(v => String(jsonValue(v) ?? ""));
        return items.join(delim);
      }
      throw ERR("#NAME?");
    }
    if (kind === "dummy") return null;
    throw new Error(`Unknown AST kind ${kind}`);
  }

  ensureDynamic() {
    if (this.dynamicReady) return;
    this.dynamicReady = true;

    // Darbu plāns spill: FILTER Tāme rows where U (position labor hours) > 0.
    const selected = [];
    for (let r = 2; r <= 340; r++) {
      const u = this.get("Tāme", `U${r}`, false);
      if (!isErr(u) && Number(u) > 0) selected.push(r);
    }
    selected.forEach((sourceRow, i) => {
      const target = i + 3;
      this.spill.set(`Darbu plāns!A${target}`, this.get("Tāme", `A${sourceRow}`, false));
      this.spill.set(`Darbu plāns!B${target}`, this.get("Tāme", `D${sourceRow}`, false));
      this.spill.set(`Darbu plāns!G${target}`, this.get("Tāme", `U${sourceRow}`, false));
    });

    // Mechanism list spill: material description + W:Z for active Tāme rows.
    const mechanismRows = [];
    for (let r = 2; r <= 340; r++) {
      const total = this.get("Tāme", `R${r}`, false);
      if (!isErr(total) && Number(total) > 0) {
        mechanismRows.push([
          this.get("Tāme", `B${r}`, false),
          this.get("Tāme", `W${r}`, false),
          this.get("Tāme", `X${r}`, false),
          this.get("Tāme", `Y${r}`, false),
          this.get("Tāme", `Z${r}`, false),
        ]);
      }
    }
    mechanismRows.forEach((row, i) => row.forEach((v, j) => this.spill.set(`Mehānismu saraksts!${numToCol(j+1)}${i+2}`, v)));
    const tools = [];
    const seen = new Set();
    for (const row of mechanismRows) {
      for (const v of row.slice(1)) {
        if (isBlank(v) || isErr(v)) continue;
        const k = String(v);
        if (!seen.has(k)) { seen.add(k); tools.push(v); }
      }
    }
    tools.forEach((v,i) => this.spill.set(`Mehānismu saraksts!F${i+2}`, v));

    // Dienas plāns B2:B75: positions active during each calculated project day.
    // J/K depend on the spills above, so evaluate them after the work-plan rows exist.
    for (let row = 2; row <= 75; row++) {
      const day = this.get("Dienas plāns", `A${row}`, false);
      if (typeof day !== "number") continue;
      const names = [];
      for (let wr = 3; wr <= 99; wr++) {
        const name = this.get("Darbu plāns", `A${wr}`, false);
        if (isBlank(name) || isErr(name)) continue;
        const start = this.get("Darbu plāns", `J${wr}`, false);
        const end = this.get("Darbu plāns", `K${wr}`, false);
        if (!isErr(start) && !isErr(end) && Number(start) < day && Number(end) > day - 1) names.push(String(name));
      }
      this.spill.set(`Dienas plāns!B${row}`, names.join(""));
    }
  }

  exportSheet(sheet) {
    this.ensureDynamic();
    const s = model.sheets[sheet];
    if (!s) throw new Error(`Unknown sheet ${sheet}`);
    const rows = [];
    for (let r=1; r<=s.rows; r++) {
      const row=[];
      for (let c=1; c<=s.cols; c++) row.push(jsonValue(this.get(sheet, `${numToCol(c)}${r}`)));
      rows.push(row);
    }
    return rows;
  }

  estimateRows() {
    const rows = [];
    for (let r=2; r<=342; r++) {
      const v = c => jsonValue(this.get("Tāme", `${c}${r}`, false));
      const category=v("A"), material=v("B");
      if (isBlank(category) && isBlank(material)) continue;
      rows.push({
        row:r, category, material, clarification:v("C"), quantity:v("D"), wasteFactor:v("E"),
        quantityWithWaste:v("F"), unit:v("G"), unitPriceExVat:v("H"), materialCost:v("I"),
        hoursPerUnit:v("J"), laborUnit:v("K"), laborHours:v("L"), hourlyRate:v("M"),
        laborCostPerUnit:v("N"), laborCost:v("O"), markedUpLaborHours:v("P"),
        markedUpLaborCost:v("Q"), totalLaborAndMaterials:v("R"), positionMaterials:v("S"),
        positionLabor:v("T"), positionLaborHours:v("U"), positionTotal:v("V"),
        mechanisms:[v("W"),v("X"),v("Y"),v("Z")].filter(x=>!isBlank(x)),
      });
    }
    return rows;
  }

  summaryRows() {
    return this.exportSheet("Kopsavilkums").slice(1).map((r,i) => ({
      row:i+2, position:r[0], unit:r[1], quantity:r[2], materialCost:r[3],
      materialCostPerUnit:r[4], laborHours:r[5], hourlyRate:r[6], laborCost:r[7],
      laborCostPerUnit:r[8], total:r[9], totalPerUnit:r[10],
    })).filter(r => !isBlank(r.position));
  }

  materialList() {
    // Backward-compatible alias. The source workbook's "Materiālu saraksts" tab is empty,
    // so the standalone engine generates a procurement-ready physical material list.
    return this.procurementOutput().consolidatedMaterials;
  }

  workPlan() {
    this.ensureDynamic();
    const rows=[];
    for (let r=3; r<=99; r++) {
      const position=jsonValue(this.get("Darbu plāns",`A${r}`));
      if (isBlank(position)) continue;
      rows.push({
        row:r, position, quantity:jsonValue(this.get("Darbu plāns",`B${r}`)),
        laborHours:jsonValue(this.get("Darbu plāns",`G${r}`)),
        crewSize:jsonValue(this.get("Darbu plāns",`H${r}`)),
        durationDays:jsonValue(this.get("Darbu plāns",`I${r}`)),
        startDay:jsonValue(this.get("Darbu plāns",`J${r}`)),
        endDay:jsonValue(this.get("Darbu plāns",`K${r}`)),
      });
    }
    return rows;
  }

  dailyPlan() {
    this.ensureDynamic();
    const rows=[];
    for (let r=2;r<=75;r++) {
      const day=jsonValue(this.get("Dienas plāns",`A${r}`));
      if (isBlank(day)) continue;
      rows.push({
        day, plan:jsonValue(this.get("Dienas plāns",`B${r}`)),
        date:jsonValue(this.get("Dienas plāns",`C${r}`)),
        workWeek:jsonValue(this.get("Dienas plāns",`D${r}`)),
        completion:jsonValue(this.get("Dienas plāns",`E${r}`)),
        participants:jsonValue(this.get("Dienas plāns",`F${r}`)),
        hoursOnSite:jsonValue(this.get("Dienas plāns",`G${r}`)),
        completed100:jsonValue(this.get("Dienas plāns",`H${r}`)),
        comments:jsonValue(this.get("Dienas plāns",`I${r}`)),
      });
    }
    return rows;
  }

  mechanisms() {
    this.ensureDynamic();
    const tasks=[];
    for (let r=2;r<=1000;r++) {
      const work=jsonValue(this.get("Mehānismu saraksts",`A${r}`));
      if (isBlank(work)) continue;
      tasks.push({work, mechanisms:["B","C","D","E"].map(c=>jsonValue(this.get("Mehānismu saraksts",`${c}${r}`))).filter(x=>!isBlank(x))});
    }
    const uniqueTools=[];
    for (let r=2;r<=1000;r++) {
      const v=jsonValue(this.get("Mehānismu saraksts",`F${r}`));
      if (!isBlank(v)) uniqueTools.push(v);
    }
    return {tasks, uniqueTools};
  }


  detailedEstimateOutput() {
    const allRows = this.estimateRows();
    const activeRows = allRows.filter(r =>
      safeNumber(r.materialCost) !== 0 ||
      safeNumber(r.laborHours) !== 0 ||
      safeNumber(r.laborCost) !== 0 ||
      safeNumber(r.totalLaborAndMaterials) !== 0 ||
      safeNumber(r.positionTotal) !== 0
    );
    let currentCategory = null;
    const withCategory = allRows.map(row => {
      if (!isBlank(row.category)) currentCategory = row.category;
      return { ...row, parentCategory: currentCategory };
    });
    const positionRows = withCategory.filter(r => !isBlank(r.category));
    return {
      headers: this.exportSheet("Tāme")[0],
      allRows: withCategory,
      activeRows: withCategory.filter(r => activeRows.some(a => a.row === r.row)),
      positionRows,
      totals: {
        materialCostExVat: activeRows.reduce((s,r)=>s+safeNumber(r.materialCost),0),
        laborCost: activeRows.reduce((s,r)=>s+safeNumber(r.laborCost),0),
        laborHours: activeRows.reduce((s,r)=>s+safeNumber(r.laborHours),0),
        lineTotal: activeRows.reduce((s,r)=>s+safeNumber(r.totalLaborAndMaterials),0),
      }
    };
  }

  costSummaryOutput() {
    const matrix = this.exportSheet("Kopsavilkums");
    const positions = [];
    for (let r=2; r<=54; r++) {
      const row = matrix[r-1] || [];
      if (isBlank(row[0])) continue;
      positions.push({
        row: r,
        position: row[0], unit: row[1], quantity: row[2],
        materialCost: row[3], materialCostPerUnit: row[4],
        laborHours: row[5], hourlyRate: row[6], laborCost: row[7],
        laborCostPerUnit: row[8], totalCost: row[9], totalCostPerUnit: row[10],
      });
    }
    const metrics = {};
    for (let r=55; r<=76; r++) {
      const row = matrix[r-1] || [];
      if (isBlank(row[0])) continue;
      metrics[slugKey(row[0])] = {
        row: r, label: row[0], value: row[1], secondaryLabel: row[2], secondaryValue: row[3],
      };
    }
    return {
      headers: matrix[0],
      positions,
      activePositions: positions.filter(x => safeNumber(x.totalCost) !== 0 || safeNumber(x.quantity) !== 0),
      totalsRow: matrix[54],
      metrics,
      raw: matrix,
    };
  }

  customerOfferOutput() {
    const m = this.exportSheet("Piedāvājums");
    const lineItems = [];
    for (let r=8; r<=54; r++) {
      const row=m[r-1] || [];
      if (isBlank(row[1])) continue;
      lineItems.push({
        row:r, multiplier:row[0], description:row[1], specification:row[2],
        unit:row[3], quantity:row[4], totalExVat:row[5],
      });
    }
    const legacyRows = [];
    for (let r=67; r<=71; r++) legacyRows.push({ row:r, values:m[r-1] || [] });
    return {
      title: m[1]?.[0] ?? null,
      materialAndCostListTitle: m[4]?.[0] ?? null,
      lineItems,
      activeLineItems: lineItems.filter(x => safeNumber(x.totalExVat)!==0 || safeNumber(x.quantity)!==0),
      pricing: {
        laborHourlyRate: m[54]?.[4] ?? null,
        directLabor: m[54]?.[5] ?? null,
        employerSocialRate: m[55]?.[4] ?? null,
        employerSocial: m[55]?.[5] ?? null,
        overheadRate: m[56]?.[4] ?? null,
        overhead: m[56]?.[5] ?? null,
        subtotalExVat: m[57]?.[5] ?? null,
        vatRate: m[58]?.[5] ?? null,
        vatAmount: m[59]?.[5] ?? null,
        totalWithVat: m[60]?.[5] ?? null,
        durationWorkDays: m[64]?.[5] ?? null,
      },
      taxes: {
        personalIncomeTax: m[75]?.[5] ?? null,
        socialContributions: m[76]?.[5] ?? null,
        vat: m[77]?.[5] ?? null,
        totalTaxes: m[78]?.[5] ?? null,
      },
      marketing: {
        solutionHeading: m[84]?.[0] ?? null,
        guaranteeHeading: m[86]?.[0] ?? null,
        methodHeading: m[89]?.[0] ?? null,
        methodPoints: [92,93,94,95,96].map(r=>m[r-1]?.[0]).filter(x=>!isBlank(x)),
        sampleHeading: m[97]?.[0] ?? null,
        comments: [185,186,187].map(r=>({number:m[r-1]?.[0],text:m[r-1]?.[1]})).filter(x=>!isBlank(x.text)),
        importantHeading: m[188]?.[0] ?? null,
        importantPoints: [190,191,192,193,194,195,196].map(r=>m[r-1]?.[0]).filter(x=>!isBlank(x)),
        footer: m[197]?.[1] ?? null,
        signature: m[199]?.[3] ?? null,
      },
      chart: {
        title: m[6]?.[5] ?? null,
        categories: lineItems.map(x => x.description),
        values: lineItems.map(x => safeNumber(x.totalExVat)),
        activeCategories: lineItems.filter(x => safeNumber(x.totalExVat)!==0).map(x => x.description),
        activeValues: lineItems.filter(x => safeNumber(x.totalExVat)!==0).map(x => safeNumber(x.totalExVat)),
        sourceRange: "Piedāvājums!B8:B54 + F8:F54",
      },
      assets: outputAssets.filter(x => x.sheet === "Piedāvājums"),
      legacyBrokenBreakdown: legacyRows,
      raw: m,
    };
  }

  f2Output() {
    const m=this.exportSheet("F2 forma");
    const rows=[];
    for (let r=7;r<=291;r++) {
      const v=m[r-1] || [];
      if (isBlank(v[1])) continue;
      const isSection = isBlank(v[2]) && isBlank(v[3]) && isBlank(v[4]) && isBlank(v[10]);
      rows.push({
        row:r, type:isSection?"section":"line", number:v[0], name:v[1], unit:v[2], quantity:v[3],
        unitLaborHours:v[4], hourlyRate:v[5], unitLaborCost:v[6], unitMaterials:v[7],
        unitMechanisms:v[8], unitTotal:v[9], totalLaborHours:v[10], totalLabor:v[11],
        totalMaterials:v[12], totalMechanisms:v[13], total:v[14],
      });
    }
    return {
      title: m[1]?.[2] ?? null,
      project: m[2]?.[2] ?? null,
      estimateDateText: m[2]?.[11] ?? null,
      columns: { level1:m[4], level2:m[5] },
      rows,
      activeRows: rows.filter(x => x.type==="section" || safeNumber(x.quantity)!==0 || safeNumber(x.total)!==0),
      totals: {
        baseTotals: { laborHours:m[291]?.[10], labor:m[291]?.[11], materials:m[291]?.[12], mechanisms:m[291]?.[13], total:m[291]?.[14] },
        transport: m[292]?.[14],
        directCosts: m[293]?.[14],
        overheadRate: m[294]?.[12], overhead: m[294]?.[14],
        safetyShareOfOverhead: m[295]?.[12], safetyCost: m[295]?.[14],
        profitRate: m[296]?.[12], profit: m[296]?.[14],
        employerSocialRate: m[297]?.[12], employerSocial: m[297]?.[14],
        totalExVat: m[298]?.[14],
        vat: m[299]?.[14],
        totalWithVat: m[300]?.[14],
      },
      notes: [m[298]?.[1],m[299]?.[1]].filter(x=>!isBlank(x)),
      approval: { preparedBy:m[303]?.[1] ?? null, contractorRegistration:m[303]?.[7] ?? null },
      assets: outputAssets.filter(x => x.sheet === "F2 forma"),
      raw:m,
    };
  }

  procurementOutput() {
    const estimate=this.estimateRows();
    let currentCategory=null;
    const allCostItems=[];
    for (const row of estimate) {
      if (!isBlank(row.category)) currentCategory=row.category;
      if (safeNumber(row.materialCost)<=0 || isBlank(row.material)) continue;
      const kind=costItemKind(row.material);
      allCostItems.push({
        kind, estimateRow:row.row, category:currentCategory,
        item:row.material, quantity:row.quantityWithWaste, unit:row.unit,
        unitPriceExVat:row.unitPriceExVat, costExVat:row.materialCost,
      });
    }
    const physicalMaterials=allCostItems.filter(x=>x.kind==="physicalMaterial");
    const servicesAndRentals=allCostItems.filter(x=>x.kind==="serviceOrRental");
    const consolidatedMap=new Map();
    for (const item of physicalMaterials) {
      const key=[normalizeText(item.item),item.unit ?? "",item.unitPriceExVat ?? ""].join("|");
      if (!consolidatedMap.has(key)) consolidatedMap.set(key,{
        item:item.item, unit:item.unit, unitPriceExVat:item.unitPriceExVat,
        quantity:0, costExVat:0, categories:new Set(), sourceEstimateRows:[]
      });
      const x=consolidatedMap.get(key);
      x.quantity += safeNumber(item.quantity);
      x.costExVat += safeNumber(item.costExVat);
      if (!isBlank(item.category)) x.categories.add(item.category);
      x.sourceEstimateRows.push(item.estimateRow);
    }
    const consolidatedMaterials=[...consolidatedMap.values()].map(x=>({
      ...x, categories:[...x.categories]
    }));
    return {
      physicalMaterials,
      consolidatedMaterials,
      servicesAndRentals,
      allCostItems,
      totals: {
        physicalMaterialsExVat: physicalMaterials.reduce((s,x)=>s+safeNumber(x.costExVat),0),
        servicesAndRentalsExVat: servicesAndRentals.reduce((s,x)=>s+safeNumber(x.costExVat),0),
      },
      note: "The source workbook's Materiālu saraksts sheet is empty. This output is generated from active Tāme cost rows and separates physical procurement from services/rentals."
    };
  }

  workPlanOutput() {
    const tasks=this.workPlan();
    const totalDurationDays=tasks.reduce((max,x)=>Math.max(max,safeNumber(x.endDay)),0);
    return {
      tasks,
      totalDurationDays,
      roundedWorkDays: Math.ceil(totalDurationDays),
      crewSize: jsonValue(this.get("Ievade","B3",false)),
      hoursPerWorkDay: 8,
      workbookProductivityFactor: 0.8,
      raw:this.exportSheet("Darbu plāns"),
    };
  }

  dailyWorkLogOutput() {
    const allRows=this.dailyPlan();
    const workPlan=this.workPlanOutput();
    const plannedDays=allRows
      .filter(x=>safeNumber(x.day) <= Math.max(1,workPlan.roundedWorkDays))
      .map(dayRow => ({
        ...dayRow,
        plannedTasks: workPlan.tasks
          .filter(task => safeNumber(task.startDay) < safeNumber(dayRow.day) && safeNumber(task.endDay) > safeNumber(dayRow.day)-1)
          .map(task => task.position),
      }));
    return {
      columns: ["Dienas Nr.","Dienas plāns","Datums","Darba nedēļa","Izpilde","Dalībnieki","Stundas objektā","Pabeigts 100%","Komentāri"],
      plannedDays,
      templateRows: allRows,
      editableFields: ["date","workWeek","completion","participants","hoursOnSite","completed100","comments"],
      raw:this.exportSheet("Dienas plāns"),
    };
  }

  mechanismsOutput() {
    const data=this.mechanisms();
    return {
      ...data,
      raw:this.exportSheet("Mehānismu saraksts"),
    };
  }

  cashFlowOutput() {
    const m=this.exportSheet("Projekta naudas plūsma");
    const stages=[];
    for (let r=2;r<=5;r++) {
      const v=m[r-1] || [];
      stages.push({ row:r, stage:v[0], plannedPayment:v[1], attributableCosts:v[2], difference:v[3] });
    }
    return {
      projectTotal:m[0]?.[1] ?? null,
      stages,
      totals:{ payments:m[5]?.[1] ?? null, attributableCosts:m[5]?.[2] ?? null },
      raw:m,
    };
  }

  processingReferenceData() {
    return {
      materialPrices: this.exportSheet("Materiālu cenas"),
      laborPositions: this.exportSheet("Ch pozīcijas"),
      sheetMetalDetails: this.exportSheet("Skārda detaļas"),
    };
  }

  exactOutputSheets() {
    const procurement=this.procurementOutput();
    return {
      "Tāme": this.exportSheet("Tāme"),
      "Kopsavilkums": this.exportSheet("Kopsavilkums"),
      "Piedāvājums": this.exportSheet("Piedāvājums"),
      "F2 forma": this.exportSheet("F2 forma"),
      "Darbu plāns": this.exportSheet("Darbu plāns"),
      "Dienas plāns": this.exportSheet("Dienas plāns"),
      "Mehānismu saraksts": this.exportSheet("Mehānismu saraksts"),
      "Materiālu saraksts": procurement.consolidatedMaterials,
      "Projekta naudas plūsma": this.exportSheet("Projekta naudas plūsma"),
    };
  }

  calculateProject({ includeRawSheets = false, includeProcessingData = false, includeExactOutputSheets = false } = {}) {
    this.ensureDynamic();

    const detailedEstimate = this.detailedEstimateOutput();
    const costSummary = this.costSummaryOutput();
    const customerOffer = this.customerOfferOutput();
    const f2Estimate = this.f2Output();
    const workPlan = this.workPlanOutput();
    const dailyWorkLog = this.dailyWorkLogOutput();
    const mechanismsAndTools = this.mechanismsOutput();
    const procurement = this.procurementOutput();
    const cashFlow = this.cashFlowOutput();

    const result = {
      inputSchema: this.getInputCatalog(),
      inputs: this.getInputValues(),
      inputsBySection: this.getInputValuesBySection(),
      outputs: {
        detailedEstimate,
        costSummary,
        customerOffer,
        f2Estimate,
        workPlan,
        dailyWorkLog,
        materialsToUse: procurement,
        mechanismsAndTools,
        cashFlow,
      },

      // Backward-compatible aliases from v0.1:
      totals: detailedEstimate.totals,
      estimate: detailedEstimate.allRows,
      summary: costSummary.positions,
      offer: customerOffer,
      f2: f2Estimate,
      workPlan: workPlan.tasks,
      dailyPlan: dailyWorkLog.templateRows,
      mechanisms: mechanismsAndTools,
      materialList: procurement.consolidatedMaterials,
      cashFlow,

      audit: {
        effectiveInputCount: inputSchema.length,
        sheetRoles,
        outputSheetCount: sheetRoles.filter(x => x.role === "output").length,
        processingSheetCount: sheetRoles.filter(x => x.role === "processing").length,
        unusedOrNonEffectiveWorkbookFields: this.getUnusedWorkbookFields(),
        legacyWarnings: [
          "Piedāvājums rows 67-71 contain #REF! references in the source workbook to a missing legacy sheet named 'Izmaksu sadalījums'. The engine preserves and exposes those rows instead of inventing replacement logic.",
          "The source workbook's 'Materiālu saraksts' sheet is empty. The engine generates a procurement output from active Tāme cost rows and separates physical materials from services/rentals.",
          "Ievade!D4 and Ievade!P9 are calculation inputs used by source formulas but are not properly labelled in the workbook. They are exposed as advanced legacy inputs in inputSchema.",
        ],
      },
    };

    if (includeProcessingData) result.processing = this.processingReferenceData();
    if (includeExactOutputSheets) result.outputSheets = this.exactOutputSheets();
    if (includeRawSheets) {
      result.rawSheets = {};
      for (const name of Object.keys(model.sheets)) {
        if (model.sheets[name].rows > 0) result.rawSheets[name] = this.exportSheet(name);
      }
    }
    return result;
  }
}

export function createEngine() { return new UpRoofEngine(); }
export { inputCatalog, inputSchema };