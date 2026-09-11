'use client';

import {useEffect, useState} from 'react';
import Link from 'next/link';
import type {CrmProjectRecord} from '@/lib/crmProjectsStore';
import {CRM_ESTIMATOR_BOOLEAN_OPTIONS, CRM_ESTIMATOR_FIELD_DEFINITIONS, CRM_ESTIMATOR_FIELD_SECTIONS, createEmptyCrmEstimatorData, formatEstimatorValue, type CrmEstimatorEngineOutputs, type CrmEstimatorFormData, type CrmEstimatorOutputRow} from '@/lib/crmEstimator';

type Props = {
  locale: string;
  project: CrmProjectRecord;
  documents: Array<{name: string; url: string}>;
};

type ProjectDocument = {id: string; category: string; file_name: string; mime_type: string; file_size: number; uploaded_at: string; url?: string};

type ModuleProps = {title: string; subtitle: string; children: React.ReactNode; defaultOpen?: boolean};

function displayValue(entry: unknown) {
  if (entry === null || entry === undefined || entry === '') return '—';
  return String(entry);
}

function Module({title, subtitle, children, defaultOpen = false}: ModuleProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section id={title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button type="button" onClick={() => setOpen((current) => !current)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50">
        <span className="block text-sm font-bold text-slate-900">{title}</span>
        <span className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}>⌄</span>
      </button>
      {open ? <div className="border-t border-slate-200 px-5 py-5">{children}</div> : null}
    </section>
  );
}

function projectProgressPercent(status: string, workLogCount: number) {
  const normalized = String(status || '').toLowerCase();
  if (normalized.includes('frozen') || normalized.includes('completed')) return 100;
  if (workLogCount > 0) return Math.min(95, 35 + workLogCount * 10);
  if (normalized.includes('estimate_done') || normalized.includes('project_started')) return 67;
  if (normalized.includes('estimating') || normalized.includes('quote_sent')) return 35;
  return 15;
}

type ProcessedEstimatorRow = CrmEstimatorOutputRow;

const requiredEstimatorKeys: Array<keyof CrmEstimatorFormData> = ['existingRoofArea', 'buildingType', 'desiredRoofCovering', 'materialType', 'roofPitch'];

function createProcessedRows(data: CrmEstimatorFormData): ProcessedEstimatorRow[] {
  const area = data.existingRoofArea.trim();
  const rows = [
    [data.desiredRoofCovering, area, 'm²'],
    [data.materialType, area, 'm²'],
    [data.gutterSystem, data.gutterSystem ? '1' : '', 'kompl.'],
    [data.insulation, data.insulation ? area : '', 'm²'],
  ].filter((row) => row[0] && row[1]);
  return rows.map(([description, quantity, unit]) => ({description, quantity, unit, price: '', total: ''}));
}

function outputRows(value: unknown, key: string) {
  if (!value || typeof value !== 'object') return [] as Array<Record<string, unknown>>;
  const rows = (value as Record<string, unknown>)[key];
  return Array.isArray(rows) ? rows.filter((row): row is Record<string, unknown> => !!row && typeof row === 'object') : [];
}

function eur(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) ? `${amount.toFixed(2)} €` : '0.00 €';
}

function EditableText({value, onChange, className = ''}: {value: unknown; onChange: (value: string) => void; className?: string}) {
  return <input value={String(value ?? '')} onChange={(event) => onChange(event.target.value)} className={`h-8 border-0 bg-transparent px-1 text-sm outline-none focus:bg-sky-50 focus:ring-1 focus:ring-sky-300 ${className}`} />;
}

function OfferTable({rows, onChange}: {rows: Array<Record<string, unknown>>; onChange: (index: number, key: string, value: string) => void}) {
  return <div className="overflow-x-auto border border-slate-300 bg-white"><table className="min-w-[900px] w-full border-collapse text-sm"><thead className="bg-slate-100"><tr>{['Daudz.', 'Apraksts', 'Specifikācija', 'Mērvienība', 'Daudzums', 'Kopā'].map((heading) => <th key={heading} className="border border-slate-300 px-2 py-2 text-left text-xs font-bold text-slate-700">{heading}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={`offer-${index}`} className="align-top odd:bg-white even:bg-slate-50"><td className="border border-slate-200 px-2 py-1 text-center">{String(row.position ?? index + 1)}</td><td className="min-w-[360px] border border-slate-200 px-2 py-1"><EditableText value={row.description} onChange={(value) => onChange(index, 'description', value)} className="w-full" /></td><td className="border border-slate-200 px-2 py-1"><EditableText value={row.specification} onChange={(value) => onChange(index, 'specification', value)} className="w-40" /></td><td className="border border-slate-200 px-2 py-1 text-center">{String(row.unit ?? '')}</td><td className="border border-slate-200 px-2 py-1 text-right">{String(row.quantity ?? '')}</td><td className="border border-slate-200 px-2 py-1 text-right font-semibold">{eur(row.total)}</td></tr>)}</tbody></table></div>;
}

function F2Table({rows, onChange}: {rows: Array<Record<string, unknown>>; onChange: (index: number, key: string, value: string) => void}) {
  const columns = ['Nr.p.k.', 'Darba nosaukums', 'Mērvienība', 'Daudzums', 'Laika norma (c/h)', 'Likme EUR/h', 'Darba alga EUR', 'Materiāli EUR', 'Mehānismi EUR', 'Kopā EUR'];
  return <div className="overflow-x-auto border border-black bg-white"><table className="min-w-[1500px] w-full border-collapse text-xs"><thead><tr><th rowSpan={2} className="border border-black bg-slate-100 px-2 py-2">Nr.p.k.</th><th rowSpan={2} className="min-w-[300px] border border-black bg-slate-100 px-2 py-2 text-left">Darba nosaukums</th><th rowSpan={2} className="border border-black bg-slate-100 px-2 py-2">Mērvienība</th><th rowSpan={2} className="border border-black bg-slate-100 px-2 py-2">Daudzums</th><th colSpan={6} className="border border-black bg-slate-100 px-2 py-2">Vienības izmaksas un kopā uz visu apjomu</th></tr><tr>{columns.slice(4).map((heading) => <th key={heading} className="border border-black bg-slate-100 px-2 py-2">{heading}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={`f2-${index}`} className="align-top odd:bg-white even:bg-slate-50"><td className="border border-black px-2 py-1 text-center">{String(row.row ?? index + 1)}</td><td className="border border-black px-2 py-1"><EditableText value={row.name ?? row.description} onChange={(value) => onChange(index, 'name', value)} className="w-full" /></td><td className="border border-black px-2 py-1 text-center">{String(row.unit ?? '')}</td><td className="border border-black px-2 py-1 text-right">{String(row.quantity ?? '')}</td><td className="border border-black px-2 py-1 text-right">{String(row.laborHours ?? '')}</td><td className="border border-black px-2 py-1 text-right">{eur(row.laborRate ?? 18)}</td><td className="border border-black px-2 py-1 text-right">{eur(row.laborTotal)}</td><td className="border border-black px-2 py-1 text-right">{eur(row.materialTotal)}</td><td className="border border-black px-2 py-1 text-right">{eur(row.mechanisms)}</td><td className="border border-black px-2 py-1 text-right font-bold">{eur(row.totalLaborAndMaterials ?? row.total)}</td></tr>)}</tbody></table></div>;
}

function OutputTable({title, rows, nameKey, onChange, columns: _columns}: {title: string; rows: Array<Record<string, unknown>>; nameKey: string; onChange: (index: number, key: string, value: string) => void; columns?: string[]}) {
  return <div className="overflow-x-auto border border-slate-200 bg-white"><table className="min-w-full text-sm"><thead><tr><th className="border border-slate-200 px-2 py-2 text-left">Apraksts</th><th className="border border-slate-200 px-2 py-2 text-left">Daudzums</th><th className="border border-slate-200 px-2 py-2 text-left">Mērvienība</th><th className="border border-slate-200 px-2 py-2 text-left">Kopā EUR</th></tr></thead><tbody>{rows.length > 0 ? rows.map((row, index) => <tr key={`${title}-${index}`}><td className="border border-slate-200 px-2 py-1"><EditableText value={row[nameKey] ?? row.name ?? row.description ?? row.item ?? row.task ?? row.tasks} onChange={(value) => onChange(index, nameKey, value)} className="w-full" /></td><td className="border border-slate-200 px-2 py-1">{String(row.quantity ?? row.hours ?? '')}</td><td className="border border-slate-200 px-2 py-1">{String(row.unit ?? '')}</td><td className="border border-slate-200 px-2 py-1 text-right">{eur(row.total ?? row.totalExVat ?? row.totalLaborAndMaterials)}</td></tr>) : <tr><td colSpan={4} className="px-2 py-4 text-slate-500">Nospiediet “Apstrādāt tāmi”, lai ģenerētu pozīcijas.</td></tr>}</tbody></table></div>;
}

function ReferenceTable({rows, fields, settingsKey, onChange}: {rows: Array<Record<string, unknown>>; fields: Array<{key: string; label: string}>; settingsKey: string; onChange: (index: number, key: string, value: string) => void}) {
  return <div className="overflow-x-auto border border-slate-300 bg-white"><table className="min-w-full border-collapse text-sm"><thead className="bg-slate-100"><tr>{fields.map((field) => <th key={field.key} className="border border-slate-300 px-2 py-2 text-left text-xs font-bold text-slate-700">{field.label}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={`${settingsKey}-${index}`} className="odd:bg-white even:bg-slate-50">{fields.map((field) => <td key={field.key} className="border border-slate-200 px-2 py-1"><EditableText value={row[field.key]} onChange={(value) => onChange(index, `${settingsKey}.${field.key}`, value)} className={field.key === 'name' || field.key === 'position' || field.key === 'description' || field.key === 'supplier' ? 'min-w-56' : 'w-28'} /></td>)}</tr>)}</tbody></table></div>;
}

function ReferenceSettingsPanels({outputs, onChange}: {outputs: CrmEstimatorEngineOutputs; onChange: (output: keyof CrmEstimatorEngineOutputs, index: number, key: string, value: string) => void}) {
  const settings = outputs.settings || {};
  const materials = (settings.materialPrices as Array<Record<string, unknown>> | undefined) || [];
  const workRates = (settings.workRates as Array<Record<string, unknown>> | undefined) || [];
  const sheetDetails = (settings.sheetMetalDetails as Array<Record<string, unknown>> | undefined) || [];
  const slopes = (settings.slopeCoefficients as Array<Record<string, unknown>> | undefined) || [];
  const edit = (index: number, key: string, value: string) => onChange('settings', index, key, value);
  return <div className="space-y-3"><Module title="Materiālu cenas - pilns katalogs" subtitle="Visas šūnas ir rediģējamas; cena ar PVN tiek izmantota piedāvājuma aprēķinā"><ReferenceTable rows={materials} settingsKey="materialPrices" fields={[{key: 'name', label: 'Pozīcija'}, {key: 'unit', label: 'Mērvienība'}, {key: 'priceExVat', label: 'Cena/vienība bez PVN'}, {key: 'vatRate', label: 'PVN likme'}, {key: 'priceWithVat', label: 'Cena ar PVN'}, {key: 'supplier', label: 'Piegādātājs'}]} onChange={edit} /></Module><Module title="Ch pozīcijas - pilns katalogs" subtitle="Darba norma un uzcenojums tiek izmantoti F2 darba aprēķinos"><ReferenceTable rows={workRates} settingsKey="workRates" fields={[{key: 'category', label: 'Kategorija'}, {key: 'description', label: 'Pozīcija'}, {key: 'unit', label: 'Mērvienība'}, {key: 'hoursPerUnit', label: 'h/vienību'}, {key: 'rate', label: 'Stundas likme'}, {key: 'markup', label: 'Uzcenojums'}]} onChange={edit} /></Module><Module title="Skārda detaļas - pilns katalogs" subtitle="Detaļu formulas un locīšanas izmaksas"><ReferenceTable rows={sheetDetails} settingsKey="sheetMetalDetails" fields={[{key: 'category', label: 'Dzega'}, {key: 'name', label: 'Nosaukums'}, {key: 'layoutWidth', label: 'Izklājuma platums'}, {key: 'foldCount', label: 'Locījumu skaits'}, {key: 'rukkiPrice', label: 'Rukki'}, {key: 'zincPrice', label: 'Zn'}, {key: 'perforatedPrice', label: 'Perforēts'}, {key: 'rukki06Price', label: 'Rukki 0.6'}, {key: 'foldingPricePerFold', label: 'Locīšana'}]} onChange={edit} /></Module><Module title="Slīpuma koeficienti" subtitle="Šūnas tiek izmantotas, lai 2D platību pārvērstu faktiskajā jumta plaknes platībā"><ReferenceTable rows={slopes} settingsKey="slopeCoefficients" fields={[{key: 'angle', label: 'Leņķis (°)'}, {key: 'multiplier', label: 'Reizināt 2D laukumu ar'}]} onChange={edit} /></Module></div>;
}

function WorkbookOutputSections({outputs, leadId, onChange}: {outputs: CrmEstimatorEngineOutputs; leadId: string; onChange: (output: keyof CrmEstimatorEngineOutputs, index: number, key: string, value: string) => void}) {
  const offerRows = outputRows(outputs.customerOffer, 'activeLineItems');
  const f2Rows = outputRows(outputs.f2Estimate, 'activeRows');
  const materials = outputs.materialsToUse && Array.isArray(outputs.materialsToUse.consolidatedMaterials) ? outputs.materialsToUse.consolidatedMaterials as Array<Record<string, unknown>> : [];
  const tasks = outputs.workPlan && Array.isArray(outputs.workPlan.tasks) ? outputs.workPlan.tasks as Array<Record<string, unknown>> : [];
  const dailyTasks = outputRows(outputs.dailyWorkLog, 'tasks');
  const offerTotals = outputs.customerOffer?.totals as Record<string, unknown> | undefined;
  const f2Totals = outputs.f2Estimate?.totals as Record<string, unknown> | undefined;
  const downloads = [['offer', 'Piedāvājums'], ['f2', 'F2 forma'], ['materials', 'Materiāli'], ['work-plan', 'Darbu plāns'], ['daily-plan', 'Dienas plāns']];
  return <div className="mt-5 space-y-3"><div className="flex flex-wrap gap-2">{downloads.map(([kind, label]) => <a key={kind} href={`/api/estimator/${encodeURIComponent(leadId)}/pdf?kind=${kind}`} className="rounded-lg bg-sky-700 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-800">Lejupielādēt {label} PDF</a>)}</div><Module title="Piedāvājums" subtitle="MATERIĀLU UN IZMAKSU SARAKSTS"><div className="border-b border-slate-300 px-3 py-4"><h2 className="text-xl font-semibold tracking-wide text-slate-700">MATERIĀLU UN IZMAKSU SARAKSTS</h2><p className="mt-1 text-sm text-slate-500">UpRoof.EU · SIA UpLift · būvkomersanta reģistrācijas Nr. 18223</p></div><OfferTable rows={offerRows} onChange={(index, key, value) => onChange('customerOffer', index, key, value)} /><div className="grid gap-4 border-t border-slate-300 p-4 text-sm sm:grid-cols-2"><div><p>Darba devēja VSAOI: {eur(offerTotals?.employerTax)}</p><p>Virsizdevumi: {eur(offerTotals?.overhead)}</p><p>Atlaide: {eur(offerTotals?.discount)}</p></div><div className="text-right"><p>Starpsumma: {eur(offerTotals?.subtotal)}</p><p>PVN: {eur(offerTotals?.vat)}</p><p className="text-lg font-bold">Gala summa: {eur(offerTotals?.total)}</p></div></div><div className="border-t border-slate-300 p-4 text-sm text-slate-600">10 GADU GARANTIJA JUMTA RENOVĀCIJAS UN BŪVĒŠANAS DARBIEM UN 50 GADU GARANTIJA MATERIĀLIEM</div></Module><Module title="F2 forma" subtitle="Lokālā tāme Nr.1"><div className="border-b border-black px-3 py-4"><h2 className="text-lg font-bold">Lokālā tāme Nr.1</h2><p className="text-sm text-slate-600">Jumta renovācija · tāme sastādīta pēc projekta datiem</p></div><F2Table rows={f2Rows} onChange={(index, key, value) => onChange('f2Estimate', index, key, value)} /><div className="flex justify-end border-t border-black p-4 text-sm"><div className="space-y-1 text-right"><p>Tiešās izmaksas: {eur(f2Totals?.directCosts)}</p><p>Virsizdevumi: {eur(f2Totals?.overhead)}</p><p>Peļņa: {eur(f2Totals?.profit)}</p><p>Darba devēja soc. nodoklis: {eur(f2Totals?.employerTax)}</p><p>Pavisam kopā bez PVN: {eur(f2Totals?.subtotalExVat)}</p><p>PVN 21%: {eur(f2Totals?.vat)}</p><p className="text-lg font-bold">Kopā ar PVN: {eur(f2Totals?.totalIncVat)}</p></div></div></Module><Module title="Materiālu cenas" subtitle="Rediģējami cenu iestatījumi"><OutputTable title="Materiālu cenas" rows={(outputs.settings?.materialPrices as Array<Record<string, unknown>> | undefined) || materials} nameKey="name" onChange={(index, key, value) => onChange('settings', index, key, value)} /></Module><Module title="Ch pozīcijas" subtitle="Darba likmes un uzcenojums"><OutputTable title="Ch pozīcijas" rows={(outputs.settings?.workRates as Array<Record<string, unknown>> | undefined) || []} nameKey="category" onChange={(index, key, value) => onChange('settings', index, key, value)} /></Module><Module title="Skārda detaļas" subtitle="Skārda detaļu aprēķina cenas"><OutputTable title="Skārda detaļas" rows={(outputs.settings?.sheetMetalDetails as Array<Record<string, unknown>> | undefined) || []} nameKey="name" onChange={(index, key, value) => onChange('settings', index, key, value)} /></Module><Module title="Slīpuma koeficients" subtitle="Jumta slīpuma reizinātājs"><div className="p-4 text-sm text-slate-700">Aktīvais koeficients: <strong>{String(outputs.settings?.slopeCoefficient ?? '1.000')}</strong></div></Module><Module title="Darbu plāns" subtitle="Kopējais darbu grafiks"><OutputTable title="Darbu plāns" rows={tasks} nameKey="task" onChange={(index, key, value) => onChange('workPlan', index, key, value)} /></Module><Module title="Dienas plāns" subtitle="Darbu izpildes uzskaite"><OutputTable title="Dienas plāns" rows={dailyTasks} nameKey="tasks" onChange={(index, key, value) => onChange('dailyWorkLog', index, key, value)} /></Module></div>;
}

function EngineOutputSections({outputs, leadId, onChange}: {outputs: CrmEstimatorEngineOutputs; leadId: string; onChange: (output: keyof CrmEstimatorEngineOutputs, index: number, key: string, value: string) => void}) {
  const materials = outputs.materialsToUse && Array.isArray(outputs.materialsToUse.consolidatedMaterials) ? outputs.materialsToUse.consolidatedMaterials as Array<Record<string, unknown>> : [];
  const tasks = outputs.workPlan && Array.isArray(outputs.workPlan.tasks) ? outputs.workPlan.tasks as Array<Record<string, unknown>> : [];
  const downloads = [['offer', 'Lejupielādēt Piedāvājumu'], ['f2', 'Lejupielādēt F2 formu'], ['materials', 'Lejupielādēt materiālu sarakstu'], ['work-plan', 'Lejupielādēt darbu plānu'], ['daily-plan', 'Lejupielādēt dienas plānu']];
  return <div className="mt-5 space-y-3"><div className="flex flex-wrap gap-2">{downloads.map(([kind, label]) => <a key={kind} href={`/api/estimator/${encodeURIComponent(leadId)}/pdf?kind=${kind}`} className="rounded-lg bg-sky-700 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-800">{label} PDF</a>)}</div><Module title="Piedāvājums" subtitle="Klientam paredzētais piedāvājums"><OutputTable title="Materiālu un izmaksu saraksts" rows={outputRows(outputs.customerOffer, 'activeLineItems')} nameKey="description" onChange={(index, key, value) => onChange('customerOffer', index, key, value)} columns={['Daudz.', 'Apraksts', 'Specifikācija', 'Mērvienība', 'Daudzums', 'Kopā EUR']} /></Module><Module title="F2 forma" subtitle="Lokālā tāme Nr.1"><OutputTable title="Lokālā tāme Nr.1" rows={outputRows(outputs.f2Estimate, 'activeRows')} nameKey="name" onChange={(index, key, value) => onChange('f2Estimate', index, key, value)} columns={['Nr.p.k.', 'Darba nosaukums', 'Mērvienība', 'Daudzums', 'Vienības izmaksas EUR', 'Darba alga EUR', 'Materiāli EUR', 'Mehānismi EUR', 'Kopā EUR']} /></Module><Module title="Materiālu cenas" subtitle="Rediģējami cenu iestatījumi"><OutputTable title="Materiālu cenas" rows={(outputs.settings?.materialPrices as Array<Record<string, unknown>> | undefined) || materials} nameKey="name" onChange={(index, key, value) => onChange('settings', index, key, value)} /></Module><Module title="Ch pozīcijas" subtitle="Darba likmes un uzcenojums"><OutputTable title="Ch pozīcijas" rows={(outputs.settings?.workRates as Array<Record<string, unknown>> | undefined) || []} nameKey="category" onChange={(index, key, value) => onChange('settings', index, key, value)} /></Module><Module title="Skārda detaļas" subtitle="Skārda detaļu aprēķina cenas"><OutputTable title="Skārda detaļas" rows={(outputs.settings?.sheetMetalDetails as Array<Record<string, unknown>> | undefined) || []} nameKey="name" onChange={(index, key, value) => onChange('settings', index, key, value)} /></Module><Module title="Slīpuma koeficients" subtitle="Jumta slīpuma reizinātājs"><div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">Aktīvais koeficients: <strong>{String(outputs.settings?.slopeCoefficient ?? '1.000')}</strong>. Tas reizina 2D jumta platību, lai aprēķinātu slīpo plakni.</div></Module><Module title="Darbu plāns" subtitle="Kopējais darbu grafiks"><OutputTable title="Darbu plāns" rows={tasks} nameKey="task" onChange={(index, key, value) => onChange('workPlan', index, key, value)} /></Module><Module title="Dienas plāns" subtitle="Darbu izpildes uzskaite"><OutputTable title="Dienas plāns" rows={outputRows(outputs.dailyWorkLog, 'tasks')} nameKey="tasks" onChange={(index, key, value) => onChange('dailyWorkLog', index, key, value)} /></Module></div>;
}

function EstimatorWorkflow({project, initialData}: {project: CrmProjectRecord; initialData: CrmEstimatorFormData}) {
  const [data, setData] = useState<CrmEstimatorFormData>(initialData || createEmptyCrmEstimatorData());
  const [version, setVersion] = useState(project.updatedAtUtc);
  const [rows, setRows] = useState<ProcessedEstimatorRow[]>(initialData.processedRows || []);
  const [finalised, setFinalised] = useState(initialData.processingStatus === 'finalised');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [engineOutputs, setEngineOutputs] = useState<CrmEstimatorEngineOutputs>(initialData.engineOutputs || {});

  const update = <K extends keyof CrmEstimatorFormData>(key: K, value: CrmEstimatorFormData[K]) => setData((current) => ({...current, [key]: value}));
  const missing = requiredEstimatorKeys.filter((key) => data[key] === '' || data[key] === null || data[key] === undefined);

  const updateEngineOutput = (output: keyof CrmEstimatorEngineOutputs, index: number, key: string, value: string) => {
    setEngineOutputs((current) => {
      const section = current[output];
      if (!section || typeof section !== 'object') return current;
      const [settingsKey, settingsField] = key.split('.', 2);
      const inferredSettingsKey = settingsKey || (section.workRates && ['category', 'hoursPerUnit', 'rate', 'markup'].includes(key) ? 'workRates' : section.sheetMetalDetails && ['width', 'priceRukki', 'priceZn'].includes(key) ? 'sheetMetalDetails' : 'materialPrices');
      const rowsKey = output === 'customerOffer' ? 'activeLineItems' : output === 'f2Estimate' ? 'activeRows' : output === 'materialsToUse' ? 'consolidatedMaterials' : output === 'settings' ? inferredSettingsKey : 'tasks';
      const fieldKey = output === 'settings' && settingsField ? settingsField : key;
      const rows = Array.isArray(section[rowsKey]) ? section[rowsKey] as Array<Record<string, unknown>> : [];
      const nextRows = rows.map((row, rowIndex) => {
        if (rowIndex !== index) return row;
        const nextRow = {...row, [fieldKey]: value};
        if (output === 'settings' && rowsKey === 'materialPrices' && (fieldKey === 'priceExVat' || fieldKey === 'vatRate')) {
          const price = Number(nextRow.priceExVat);
          const vat = Number(nextRow.vatRate);
          nextRow.priceWithVat = Number.isFinite(price) && Number.isFinite(vat) ? (price * vat).toFixed(4) : nextRow.priceWithVat;
        }
        return nextRow;
      });
      return {...current, [output]: {...section, [rowsKey]: nextRows}};
    });
  };



  const save = async (nextRows = rows, nextStatus: 'draft' | 'processed' | 'finalised' = finalised ? 'finalised' : rows.length > 0 ? 'processed' : 'draft', nextOutputs = engineOutputs) => {
    setError('');
    const response = await fetch(`/api/crm/leads/${encodeURIComponent(project.leadId)}`, {method: 'PATCH', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({updatedAtUtc: version, estimatorData: {...data, engineOutputs: nextOutputs, processedRows: nextRows, processingStatus: nextStatus}})});
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || 'Estimator could not be saved');
    setVersion(result.lead.updatedAtUtc);
  };

  const process = async () => {
    if (missing.length > 0) {
      setError(`Complete the required estimator fields: ${missing.map((key) => CRM_ESTIMATOR_FIELD_DEFINITIONS.find((definition) => definition.key === key)?.label || key).join(', ')}`);
      return;
    }
    try {
      setMessage('Generating estimate...');
      const response = await fetch(`/api/crm/leads/${encodeURIComponent(project.leadId)}/estimate`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({estimatorData: {...data, engineOutputs}}),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || 'Estimate could not be generated');
      
      // Extract rows from generated output
      const generatedRows = result.outputs?.customerOffer?.activeLineItems || [];
      const nextRows = generatedRows.length > 0 
        ? generatedRows.map((row: Record<string, unknown>) => ({
            description: String(row.description || ''),
            quantity: String(row.quantity || ''),
            unit: String(row.unit || ''),
            price: String(row.unitPrice || ''),
            total: String(row.total || row.totalExVat || ''),
          }))
        : createProcessedRows(data);
      
      const nextOutputs = result.outputs as CrmEstimatorEngineOutputs;
      await save(nextRows, 'processed', nextOutputs);
      setRows(nextRows);
      setEngineOutputs(nextOutputs);
      setFinalised(false);
      setMessage('Estimate generated. Review and edit the output rows before finalising.');
    } catch (processError: any) {
      setError(processError?.message || 'Estimator could not be processed');
    }
  };

  const finalise = async () => {
    try {
      await save(rows, 'finalised', engineOutputs);
      setFinalised(true);
      setMessage('Estimator finalised. The documents are ready to download or send.');
    } catch (finaliseError: any) {
      setError(finaliseError?.message || 'Estimator could not be finalised');
    }
  };

  const estimatorPages = [
    ['estimator-data', 'Ievade'],
    ['estimator-data', 'Tāme'],
    ['materialu-cenas', 'Materiālu cenas'],
    ['ch-pozicijas', 'Ch pozīcijas'],
    ['skarda-detalas', 'Skārda detaļas'],
    ['slipuma-koeficients', 'Slīpuma koef.'],
    ['piedavajums', 'Piedāvājums'],
    ['f2-forma', 'F2 forma'],
    ['darbu-plans', 'Darbu plāns'],
    ['dienas-plans', 'Dienas plāns'],
  ];

  return <>
  <div className="mb-3 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">{estimatorPages.map(([id, label]) => <button key={id} type="button" onClick={() => document.getElementById(id)?.scrollIntoView({behavior: 'smooth', block: 'start'})} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-sky-400 hover:text-sky-700">{label}</button>)}</div>
  <Module title="Estimator data" subtitle="Lead inputs, processing and final outputs">
    <div className="mb-5 rounded-xl border border-sky-100 bg-sky-50 p-4 text-sm text-slate-700">Enter or update the CRM lead data points below, then click &quot;Process estimate&quot; to generate the output documents.</div>
    <div className="rounded-xl border border-slate-200 bg-white p-4"><h3 className="text-sm font-bold text-slate-900">Lead data points</h3><p className="mt-1 text-xs text-slate-500">Values collected in Sales CRM.</p>{CRM_ESTIMATOR_FIELD_SECTIONS.map((section) => <div key={section} className="border-b border-slate-200 py-4 last:border-b-0"><h4 className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">{section}</h4><div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{CRM_ESTIMATOR_FIELD_DEFINITIONS.filter((definition) => definition.section === section).map((definition) => { const fieldValue = data[definition.key]; const inputId = `project-estimator-${String(definition.key)}`; const isRequired = requiredEstimatorKeys.includes(definition.key); return <label key={definition.key} htmlFor={inputId} className="flex flex-col gap-1 text-sm font-medium text-slate-700"><span>{definition.label}{isRequired ? <span className="text-rose-600"> *</span> : null}</span>{definition.type === 'select' ? <select id={inputId} value={formatEstimatorValue(fieldValue)} onChange={(event) => update(definition.key, event.target.value as never)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-slate-900"><option value="">Select</option>{definition.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : definition.type === 'boolean' ? <select id={inputId} value={fieldValue === null ? '' : fieldValue ? 'true' : 'false'} onChange={(event) => update(definition.key, event.target.value === 'true' ? true : event.target.value === 'false' ? false : null as never)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-slate-900"><option value="">Select</option>{CRM_ESTIMATOR_BOOLEAN_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : definition.type === 'number' ? <input id={inputId} type="number" value={fieldValue === null ? '' : String(fieldValue)} onChange={(event) => update(definition.key, event.target.value ? Number(event.target.value) as never : null as never)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-slate-900" /> : definition.type === 'textarea' ? <textarea id={inputId} value={formatEstimatorValue(fieldValue)} onChange={(event) => update(definition.key, event.target.value as never)} rows={2} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900" /> : <input id={inputId} value={formatEstimatorValue(fieldValue)} onChange={(event) => update(definition.key, event.target.value as never)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-slate-900" />}</label>; })}</div></div>)}</div>

    <div className="mt-5 flex flex-wrap items-center gap-3"><button type="button" onClick={() => void process()} className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700">Process estimate</button>{missing.length > 0 ? <span className="text-sm text-amber-700">{missing.length} required field{missing.length === 1 ? '' : 's'} remaining</span> : null}</div>
    {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}{message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}
    {rows.length > 0 ? <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-sm font-bold text-slate-900">Processed output</h3><p className="mt-1 text-xs text-slate-500">Edit the rows before finalising the client documents.</p></div><button type="button" onClick={() => void finalise()} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">{finalised ? 'Finalised' : 'Finalise estimate'}</button></div><div className="mt-4 overflow-x-auto"><table className="min-w-full"><thead><tr>{['Description', 'Quantity', 'Unit', 'Unit price', 'Total'].map((heading) => <th key={heading} className="px-2 py-2 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{heading}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={`${row.description}-${index}`}><td className="px-2 py-2"><input value={row.description} onChange={(event) => setRows((current) => current.map((entry, rowIndex) => rowIndex === index ? {...entry, description: event.target.value} : entry))} className="h-9 min-w-52 rounded border border-slate-200 px-2 text-sm" /></td><td className="px-2 py-2"><input value={row.quantity} onChange={(event) => setRows((current) => current.map((entry, rowIndex) => rowIndex === index ? {...entry, quantity: event.target.value} : entry))} className="h-9 w-24 rounded border border-slate-200 px-2 text-sm" /></td><td className="px-2 py-2"><input value={row.unit} onChange={(event) => setRows((current) => current.map((entry, rowIndex) => rowIndex === index ? {...entry, unit: event.target.value} : entry))} className="h-9 w-24 rounded border border-slate-200 px-2 text-sm" /></td><td className="px-2 py-2"><input value={row.price} onChange={(event) => setRows((current) => current.map((entry, rowIndex) => rowIndex === index ? {...entry, price: event.target.value, total: event.target.value && row.quantity ? String(Number(event.target.value) * Number(row.quantity)) : ''} : entry))} className="h-9 w-28 rounded border border-slate-200 px-2 text-sm" /></td><td className="px-2 py-2"><input value={row.total} onChange={(event) => setRows((current) => current.map((entry, rowIndex) => rowIndex === index ? {...entry, total: event.target.value} : entry))} className="h-9 w-28 rounded border border-slate-200 px-2 text-sm" /></td></tr>)}</tbody></table></div>{finalised ? <div className="mt-4 flex flex-wrap gap-2"><a href={`/api/estimator/${encodeURIComponent(project.leadId)}/pdf?kind=f2`} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700">Download F2 forma</a><a href={`/api/estimator/${encodeURIComponent(project.leadId)}/pdf?kind=offer`} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700">Download Piedāvājums</a><a href={`mailto:?subject=${encodeURIComponent(`Piedāvājums - ${project.title}`)}`} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700">Send to client email</a></div> : null}</div> : null}
  </Module>
  <WorkbookOutputSections leadId={project.leadId} outputs={engineOutputs} onChange={updateEngineOutput} />
  <ReferenceSettingsPanels outputs={engineOutputs} onChange={updateEngineOutput} />
  </>;
}

function FinancialModule({project}: {project: CrmProjectRecord}) {
  const [open, setOpen] = useState<'payments' | 'invoices' | 'cash' | 'profit' | null>(null);
  const toggle = (key: 'payments' | 'invoices' | 'cash' | 'profit') => setOpen((current) => current === key ? null : key);
  return <Module title="Financials" subtitle="">
    <div className="grid gap-3 md:grid-cols-4">{[['payments', 'Payment Stages'], ['invoices', 'Invoices'], ['cash', 'Cash Flow'], ['profit', 'Profitability']].map(([key, label]) => <button key={key} type="button" onClick={() => toggle(key as 'payments' | 'invoices' | 'cash' | 'profit')} className={`rounded-xl border p-4 text-left ${open === key ? 'border-sky-300 bg-sky-50' : 'border-slate-200 bg-slate-50'}`}><span className="text-xs text-slate-500">{label}</span><strong className="mt-2 block text-sm text-slate-900">{key === 'profit' ? project.budget || '—' : key === 'invoices' ? 'Not recorded' : key === 'cash' ? 'Not recorded' : 'Not recorded'}</strong></button>)}</div>
    {open === 'payments' ? <div className="mt-4 overflow-x-auto"><table className="min-w-full divide-y divide-slate-200"><thead><tr>{['Stage', 'Contract amount', 'Paid', 'Balance', 'Due date'].map((heading) => <th key={heading} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{heading}</th>)}</tr></thead><tbody><tr>{['Stage 1', 'Not recorded', 'Not recorded', 'Not recorded', 'Not recorded'].map((entry) => <td key={entry} className="px-3 py-3 text-sm text-slate-700">{entry}</td>)}</tr></tbody></table></div> : null}
    {open === 'invoices' ? <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">No project invoices are recorded. Upload or connect invoices through the project document workflow.</div> : null}
    {open === 'cash' ? <div className="mt-4 overflow-x-auto"><table className="min-w-full divide-y divide-slate-200"><thead><tr>{['Stage', 'Costs', 'Contract amount', 'Balance'].map((heading) => <th key={heading} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{heading}</th>)}</tr></thead><tbody><tr>{['Total', 'Not recorded', project.budget || '—', 'Not recorded'].map((entry) => <td key={entry} className="px-3 py-3 text-sm text-slate-700">{entry}</td>)}</tr></tbody></table></div> : null}
    {open === 'profit' ? <div className="mt-4 overflow-x-auto"><table className="min-w-full divide-y divide-slate-200"><thead><tr>{['Category', 'Actual', 'Estimate', 'Result / Profitability'].map((heading) => <th key={heading} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{heading}</th>)}</tr></thead><tbody>{['Materials', 'Wages', 'Man-hours', 'Overhead', 'Total'].map((category) => <tr key={category}><td className="px-3 py-3 text-sm font-semibold text-slate-900">{category}</td><td className="px-3 py-3 text-sm text-slate-500">Not recorded</td><td className="px-3 py-3 text-sm text-slate-500">Not recorded</td><td className="px-3 py-3 text-sm text-slate-500">Not recorded</td></tr>)}</tbody></table></div> : null}
  </Module>;
}

function CustomKpiModule() {
  const [kpis, setKpis] = useState<Array<{name: string; target: string; format: string}>>([]);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [format, setFormat] = useState('Number');
  return <Module title="Custom KPIs" subtitle="">
    <div className="grid gap-3 md:grid-cols-[1fr_1fr_160px_auto]"><input value={name} onChange={(event) => setName(event.target.value)} placeholder="KPI name" className="h-10 rounded-xl border border-slate-200 px-3 text-sm" /><input value={target} onChange={(event) => setTarget(event.target.value)} placeholder="Target or formula" className="h-10 rounded-xl border border-slate-200 px-3 text-sm" /><select value={format} onChange={(event) => setFormat(event.target.value)} className="h-10 rounded-xl border border-slate-200 px-3 text-sm"><option>Number</option><option>Percent</option><option>Currency</option><option>Duration</option></select><button type="button" onClick={() => { if (name.trim()) { setKpis((current) => [...current, {name: name.trim(), target: target.trim(), format}]); setName(''); setTarget(''); } }} className="h-10 rounded-xl bg-sky-500 px-4 text-sm font-semibold text-white">Add KPI</button></div>
    {kpis.length > 0 ? <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{kpis.map((kpi) => <div key={`${kpi.name}-${kpi.target}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="font-semibold text-slate-900">{kpi.name}</p><p className="mt-1 text-sm text-slate-500">Target: {kpi.target || '—'} · {kpi.format}</p></div>)}</div> : <p className="mt-4 text-sm text-slate-500">No custom KPIs configured.</p>}
  </Module>;
}

function ProjectDocumentsModule({project, initialDocuments}: {project: CrmProjectRecord; initialDocuments: Array<{name: string; url: string}>}) {
  const [documents, setDocuments] = useState<ProjectDocument[]>(initialDocuments.map((document, index) => ({id: `legacy-${index}`, category: 'other', file_name: document.name, mime_type: 'application/octet-stream', file_size: 0, uploaded_at: '', url: document.url})));
  const [category, setCategory] = useState('contract');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/crm/projects/${encodeURIComponent(project.leadId)}/documents`, {cache: 'no-store'})
      .then((response) => response.json())
      .then((data) => { if (data.ok) setDocuments(data.documents.map((document: ProjectDocument) => ({...document, url: `/api/crm/projects/${encodeURIComponent(project.leadId)}/documents/${encodeURIComponent(document.id)}`}))); })
      .catch(() => undefined);
  }, [project.leadId]);

  const upload = async (files: File[]) => {
    setUploading(true);
    setError('');
    try {
      const uploaded: ProjectDocument[] = [];
      for (const file of files) {
        const form = new FormData();
        form.set('category', category);
        form.set('file', file);
        const response = await fetch(`/api/crm/projects/${encodeURIComponent(project.leadId)}/documents`, {method: 'POST', body: form});
        const data = await response.json();
        if (!data.ok) throw new Error(data.error || `Upload failed for ${file.name}`);
        uploaded.push({...data.document, url: `/api/crm/projects/${encodeURIComponent(project.leadId)}/documents/${encodeURIComponent(data.document.id)}`});
      }
      setDocuments((current) => [...uploaded, ...current]);
    } catch (uploadError: any) {
      setError(uploadError?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const groups = [
    ['contract', 'Contract'],
    ['invoice', 'Invoices'],
    ['estimate', 'Estimate'],
    ['certificate', 'Certificate of Acceptance'],
    ['other', 'Other documents'],
  ];

  return <Module title="Project documents" subtitle="">
    <div className="flex flex-wrap items-center gap-2"><select value={category} onChange={(event) => setCategory(event.target.value)} className="h-10 rounded-xl border border-slate-200 px-3 text-sm">{groups.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select><label className="inline-flex h-10 cursor-pointer items-center rounded-xl bg-sky-500 px-4 text-sm font-semibold text-white">{uploading ? 'Uploading...' : 'Add document'}<input type="file" multiple className="hidden" disabled={uploading} onChange={(event) => { const files = Array.from(event.target.files || []); if (files.length > 0) void upload(files); event.currentTarget.value = ''; }} /></label>{error ? <span className="text-sm text-rose-600">{error}</span> : null}</div>
    <div className="mt-5 grid gap-4 md:grid-cols-2">{groups.map(([key, label]) => <div key={key} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><h3 className="text-sm font-bold text-slate-900">{label}</h3><div className="mt-3 space-y-2">{documents.filter((document) => document.category === key).map((document) => <div key={document.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3"><span className="min-w-0 truncate text-sm font-medium text-slate-900">{document.file_name}</span>{document.url ? <a href={document.url} target="_blank" rel="noreferrer" className="shrink-0 text-xs font-semibold text-sky-700">Preview</a> : null}</div>)}{documents.every((document) => document.category !== key) ? <p className="text-sm text-slate-500">No documents</p> : null}</div></div>)}</div>
  </Module>;
}

function ProjectProgressModule({project, estimatorData}: {project: CrmProjectRecord; estimatorData: CrmEstimatorFormData}) {
  const initialTasks = outputRows(estimatorData.engineOutputs?.dailyWorkLog, 'tasks');
  const [tasks, setTasks] = useState<Array<Record<string, unknown>>>(initialTasks);
  const [newTask, setNewTask] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const saveTasks = async (nextTasks: Array<Record<string, unknown>>) => {
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch(`/api/crm/leads/${encodeURIComponent(project.leadId)}`, {method: 'PATCH', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({updatedAtUtc: project.updatedAtUtc, estimatorData: {...estimatorData, engineOutputs: {...estimatorData.engineOutputs, dailyWorkLog: {tasks: nextTasks}}}})});
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || 'Neizdevās saglabāt dienas plānu');
      setMessage('Dienas darba žurnāls saglabāts');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Neizdevās saglabāt dienas plānu');
    } finally {
      setSaving(false);
    }
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    const nextTasks = [...tasks, {day: tasks.length + 1, date: new Date().toISOString().slice(0, 10), tasks: newTask.trim(), hours: '', crew: '', completed: false, comments: ''}];
    setTasks(nextTasks);
    setNewTask('');
    void saveTasks(nextTasks);
  };

  const updateTask = (index: number, key: string, value: unknown) => setTasks((current) => current.map((task, taskIndex) => taskIndex === index ? {...task, [key]: value} : task));

  return <Module title="Project management and progress" subtitle="Darbu plāns un ikdienas darba žurnāls" defaultOpen><div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]"><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs text-slate-500">Current progress</p><p className="mt-2 text-xl font-bold text-slate-900">{project.progress || project.status}</p><p className="mt-4 text-sm text-slate-600">{project.note || 'Pievienojiet dienas darba ierakstus, lai sekotu būvdarbu gaitai.'}</p><div className="mt-5 border-t border-slate-200 pt-4"><p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Jauns dienas ieraksts</p><div className="mt-2 flex gap-2"><input value={newTask} onChange={(event) => setNewTask(event.target.value)} placeholder="Paveiktais darbs" className="h-9 min-w-0 flex-1 rounded border border-slate-200 px-2 text-sm" /><button type="button" onClick={addTask} className="rounded bg-sky-700 px-3 text-xs font-semibold text-white">Pievienot</button></div></div></div><div><div className="mb-3 flex items-center justify-between gap-3"><h3 className="text-sm font-bold text-slate-900">Dienas plāns / darba žurnāls</h3><button type="button" disabled={saving} onClick={() => void saveTasks(tasks)} className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">{saving ? 'Saglabā...' : 'Saglabāt'}</button></div>{message ? <p className="mb-3 text-xs text-sky-700">{message}</p> : null}{tasks.length > 0 ? <div className="overflow-x-auto border border-slate-200"><table className="min-w-[760px] w-full border-collapse text-sm"><thead className="bg-slate-100"><tr>{['Diena', 'Datums', 'Darba plāns', 'Stundas', 'Pabeigts', 'Komentāri'].map((heading) => <th key={heading} className="border border-slate-200 px-2 py-2 text-left text-xs font-bold text-slate-600">{heading}</th>)}</tr></thead><tbody>{tasks.map((task, index) => <tr key={`daily-log-${index}`} className="align-top"><td className="border border-slate-200 px-2 py-1 text-center">{String(task.day ?? index + 1)}</td><td className="border border-slate-200 px-2 py-1"><input type="date" value={String(task.date ?? '')} onChange={(event) => updateTask(index, 'date', event.target.value)} className="h-8 border-0 bg-transparent text-xs" /></td><td className="min-w-[260px] border border-slate-200 px-2 py-1"><input value={String(task.tasks ?? '')} onChange={(event) => updateTask(index, 'tasks', event.target.value)} className="h-8 w-full border-0 bg-transparent text-sm" /></td><td className="border border-slate-200 px-2 py-1"><input value={String(task.hours ?? '')} onChange={(event) => updateTask(index, 'hours', event.target.value)} className="h-8 w-20 border-0 bg-transparent text-right" /></td><td className="border border-slate-200 px-2 py-1 text-center"><input type="checkbox" checked={Boolean(task.completed)} onChange={(event) => updateTask(index, 'completed', event.target.checked)} /></td><td className="border border-slate-200 px-2 py-1"><input value={String(task.comments ?? '')} onChange={(event) => updateTask(index, 'comments', event.target.value)} className="h-8 w-full border-0 bg-transparent text-sm" /></td></tr>)}</tbody></table></div> : <p className="border border-dashed border-slate-300 p-5 text-sm text-slate-500">Nav izveidots dienas plāns. Ģenerējiet tāmi vai pievienojiet pirmo darba ierakstu.</p>}{project.workLog.length > 0 ? <div className="mt-4 space-y-2">{project.workLog.map((entry) => <div key={`${entry.time}-${entry.title}`} className="border border-slate-200 bg-white p-3"><div className="flex justify-between gap-3"><strong className="text-sm text-slate-900">{entry.title}</strong><span className="text-xs text-slate-500">{entry.time}</span></div><p className="mt-1 text-sm text-slate-600">{entry.detail}</p></div>)}</div> : null}</div></div></Module>;
}

export default function ProjectFileClient({locale, project, documents}: Props) {
  const percent = projectProgressPercent(project.status, project.workLog.length);
  const estimator = project.estimatorData;
  const [projectStatus, setProjectStatus] = useState(project.status || project.phase);
  const [projectTitle, setProjectTitle] = useState(project.title);
  const [startDate, setStartDate] = useState(project.createdAtUtc ? project.createdAtUtc.slice(0, 10) : '');
  const [endDate, setEndDate] = useState(project.dueDate || '');
  const [projectOverview, setProjectOverview] = useState(project.note || project.title);
  const [description, setDescription] = useState(project.note || '');

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-wrap items-center gap-2 text-sm">
          <Link href={`/${locale}/admin/project-360`} className="font-semibold text-sky-700 hover:text-sky-900">Projects</Link>
          <span className="text-slate-400">/</span>
          <span className="font-semibold text-slate-700">Project File</span>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">{project.id}</p><h1 className="mt-2 text-2xl font-bold text-slate-900">{project.title}</h1><p className="mt-2 text-sm text-slate-600">{project.customer}{project.company ? ` · ${project.company}` : ''}</p></div><span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">{project.phase}</span></div>
            <div className="mt-5 grid gap-3 md:grid-cols-2"><label className="block text-sm"><span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Overview</span><input value={projectOverview} onChange={(event) => setProjectOverview(event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900" /></label><label className="block text-sm"><span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Description</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={2} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900" /></label></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-4">{[['Client', project.customer], ['Location', project.location], ['Owner', project.owner], ['Value', project.budget]].map(([label, entry]) => <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-sm font-semibold text-slate-900">{entry || '—'}</p></div>)}</div>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Project work progress</p><p className="mt-3 text-3xl font-bold text-slate-900">{percent}%</p><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-sky-500" style={{width: `${percent}%`}} /></div><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><span className="text-slate-500">Project phase</span><strong className="mt-1 block text-slate-900">{project.phase}</strong></div><div><span className="text-slate-500">Work entries</span><strong className="mt-1 block text-slate-900">{project.workLog.length}</strong></div></div></section>
        </div>

        <div className="mt-5 space-y-3">
          <Module title="Client and project overview" subtitle="">
            <div className="grid gap-4 md:grid-cols-2"><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><h2 className="text-sm font-bold text-slate-900">Client data</h2><div className="mt-3 space-y-3">{[['Full name / company', project.customer + (project.company ? ` / ${project.company}` : '')], ['Legal address', project.location], ['ID No.', '—'], ['Primary contact', project.owner]].map(([label, entry]) => <label key={label} className="block text-sm"><span className="text-xs text-slate-500">{label}</span><input value={entry || ''} readOnly className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900" /></label>)}</div></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><h2 className="text-sm font-bold text-slate-900">Project data</h2><div className="mt-3 space-y-3"><label className="block text-sm"><span className="text-xs text-slate-500">Project name</span><input value={projectTitle} onChange={(event) => setProjectTitle(event.target.value)} className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900" /></label><label className="block text-sm"><span className="text-xs text-slate-500">Status</span><select value={projectStatus} onChange={(event) => setProjectStatus(event.target.value)} className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900"><option>In Progress</option><option>Scheduled</option><option>Completed</option></select></label><label className="block text-sm"><span className="text-xs text-slate-500">Start date</span><input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900" /></label><label className="block text-sm"><span className="text-xs text-slate-500">End date</span><input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900" /></label><label className="block text-sm"><span className="text-xs text-slate-500">Commercial source</span><input value="Sales CRM — Won" readOnly className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-slate-100 px-2 text-sm text-slate-700" /></label></div></div></div>
          </Module>

          <FinancialModule project={project} />

          <EstimatorWorkflow project={project} initialData={estimator} />

          <ProjectProgressModule project={project} estimatorData={estimator} />

          <ProjectDocumentsModule project={project} initialDocuments={documents} />

          <CustomKpiModule />
        </div>
      </div>
    </div>
  );
}
