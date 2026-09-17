'use client';

import {useEffect, useState} from 'react';
import Link from 'next/link';
import type {CrmProjectRecord} from '@/lib/crmProjectsStore';
import {CRM_ESTIMATOR_BOOLEAN_OPTIONS, CRM_ESTIMATOR_FIELD_DEFINITIONS, CRM_ESTIMATOR_FIELD_SECTIONS, CRM_ESTIMATOR_POLICY_FIELD_DEFINITIONS, calculateEstimatorTameRow, createEmptyCrmEstimatorData, formatEstimatorValue, type CrmEstimatorEngineOutputs, type CrmEstimatorFormData, type CrmEstimatorOutputRow, type CrmEstimatorTameRow} from '@/lib/crmEstimator';

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
  if (['Materiālu cenas', 'Ch pozīcijas', 'Skārda detaļas', 'Slīpuma koeficients', 'Darbu plāns', 'Dienas plāns'].includes(title)) return null;
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

type ProcessedEstimatorRow = CrmEstimatorOutputRow;

function TameInputModule({rows, onChange, onAdd}: {rows: CrmEstimatorTameRow[]; onChange: (index: number, key: keyof CrmEstimatorTameRow, value: string) => void; onAdd: () => void}) {
  const fields: Array<keyof CrmEstimatorTameRow> = ['category', 'name', 'specification', 'quantity', 'reserve', 'quantityWithReserve', 'unit', 'materialUnitPrice', 'materialTotal', 'hoursPerUnit', 'workHours', 'hourlyRate', 'laborUnitPrice', 'laborTotal', 'laborHoursWithMarkup', 'laborTotalWithMarkup', 'totalWorkMaterials', 'positionMaterials', 'positionWork', 'positionDuration', 'positionTotal', 'mechanisms'];
  const labels = ['Kategorija', 'Nosaukums', 'Precizējums', 'Daudzums', 'Rezerve', 'Daudzums ar rezervi', 'Mērv.', 'Cena bez PVN', 'Materiāli kopā', 'h/vienība', 'Darba ilgums', 'Likme EUR/h', 'Darba samaksa vienība', 'Darba samaksa kopā', 'Darba ilgums ar uzcenojumu', 'Darba samaksa ar uzcenojumu', 'Kopā darbs+materiāli', 'Pozīcijas materiāli', 'Pozīcijas darbs', 'Pozīcijas ilgums', 'Pozīcija kopā', 'Mehānismi'];
  return <Module title="Tāme" subtitle="Otrā ievades lapa: detalizētas pozīcijas un workbook aprēķini"><div className="overflow-x-auto"><table className="min-w-[2400px] w-full text-xs"><thead><tr>{labels.map((label) => <th key={label} className="border border-slate-300 bg-slate-100 px-2 py-2 text-left">{label}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{fields.map((field) => <td key={field} className="border border-slate-200 p-1"><input value={row[field]} readOnly={!['category', 'name', 'specification', 'quantity', 'reserve', 'unit', 'materialUnitPrice', 'hoursPerUnit', 'hourlyRate', 'mechanisms'].includes(field)} onChange={(event) => onChange(index, field, event.target.value)} className="h-8 w-28 border-0 bg-transparent px-1" /></td>)}</tr>)}</tbody></table></div><button type="button" onClick={onAdd} className="mt-3 rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold text-white">Pievienot Tāmes pozīciju</button></Module>;
}

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

function EstimatorLeadNavigator({data, onClose}: {data: CrmEstimatorFormData; onClose: () => void}) {
  const populatedFields = CRM_ESTIMATOR_FIELD_DEFINITIONS.filter((definition) => {
    const value = data[definition.key];
    return value !== '' && value !== null && value !== undefined && value !== false;
  });
  return <aside className="fixed left-0 top-24 z-40 w-[min(22rem,calc(100vw-1rem))] rounded-r-2xl border border-l-0 border-slate-200 bg-white p-4 shadow-xl">
    <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">CRM lead summary</p><p className="mt-1 text-xs text-slate-500">Saved lead values used by the estimator</p></div><button type="button" onClick={onClose} className="text-xl leading-none text-slate-400 hover:text-slate-700" aria-label="Close CRM lead summary">×</button></div>
    <div className="mt-4 max-h-[calc(100vh-11rem)] space-y-4 overflow-y-auto pr-1">{CRM_ESTIMATOR_FIELD_SECTIONS.map((section) => { const fields = populatedFields.filter((definition) => definition.section === section); if (fields.length === 0) return null; return <div key={section}><h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{section}</h3><div className="mt-2 space-y-1">{fields.map((definition) => <button key={definition.key} type="button" onClick={() => document.getElementById(`project-estimator-${String(definition.key)}`)?.scrollIntoView({behavior: 'smooth', block: 'center'})} className="block w-full rounded-lg px-2 py-1.5 text-left hover:bg-sky-50"><span className="block text-xs font-semibold text-slate-700">{definition.label}</span><span className="block truncate text-xs text-slate-500">{formatEstimatorValue(data[definition.key])}</span></button>)}</div></div>; })}{populatedFields.length === 0 ? <p className="text-sm text-slate-500">No CRM estimator values have been entered yet.</p> : null}</div>
  </aside>;
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

function WorkPlanTable({rows}: {rows: Array<Record<string, unknown>>}) {
  return <div className="overflow-x-auto border border-slate-300 bg-white"><table className="min-w-[900px] w-full border-collapse text-sm"><thead className="bg-slate-100"><tr>{['Pozīcija', 'Daudzums', 'Darba ilgums, h', 'Cilvēku skaits objektā', 'Darba ilgums, D', 'Sākuma diena', 'Beigu diena'].map((label) => <th key={label} className="border border-slate-300 px-2 py-2 text-left text-xs font-bold">{label}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}><td className="border border-slate-200 px-2 py-1">{String(row.position || '')}</td><td className="border border-slate-200 px-2 py-1 text-right">{String(row.quantity || '')}</td><td className="border border-slate-200 px-2 py-1 text-right">{String(row.workDurationHours || '')}</td><td className="border border-slate-200 px-2 py-1 text-right">{String(row.people || '')}</td><td className="border border-slate-200 px-2 py-1 text-right">{String(row.workDurationDays || '')}</td><td className="border border-slate-200 px-2 py-1 text-right">{String(row.startDay || '')}</td><td className="border border-slate-200 px-2 py-1 text-right">{String(row.endDay || '')}</td></tr>)}</tbody></table></div>;
}

function DailyPlanTable({rows}: {rows: Array<Record<string, unknown>>}) {
  return <div className="overflow-x-auto border border-slate-300 bg-white"><table className="min-w-[1000px] w-full border-collapse text-sm"><thead className="bg-slate-100"><tr>{['Dienas Nr.', 'Dienas plāns', 'Datums', 'Darba nedēļa', 'Izpilde', 'Dalībnieki', 'Stundas objektā', 'Pabeigts 100%', 'Komentāri'].map((label) => <th key={label} className="border border-slate-300 px-2 py-2 text-left text-xs font-bold">{label}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}><td className="border border-slate-200 px-2 py-1">{String(row.dayNo || index + 1)}</td><td className="border border-slate-200 px-2 py-1">{String(row.dailyPlan || '')}</td><td className="border border-slate-200 px-2 py-1">{String(row.date || '')}</td><td className="border border-slate-200 px-2 py-1">{String(row.workWeek || '')}</td><td className="border border-slate-200 px-2 py-1">{String(row.execution || '')}</td><td className="border border-slate-200 px-2 py-1">{String(row.participants || '')}</td><td className="border border-slate-200 px-2 py-1">{String(row.hoursAtFacility || '')}</td><td className="border border-slate-200 px-2 py-1 text-center">{row.completed ? '✓' : ''}</td><td className="border border-slate-200 px-2 py-1">{String(row.comments || '')}</td></tr>)}</tbody></table></div>;
}

function WorkbookPlanSections({outputs}: {outputs: CrmEstimatorEngineOutputs}) {
  const workPlan = Array.isArray(outputs.workPlan?.tasks) ? outputs.workPlan.tasks as Array<Record<string, unknown>> : [];
  const dailyPlan = Array.isArray(outputs.dailyWorkLog?.tasks) ? outputs.dailyWorkLog.tasks as Array<Record<string, unknown>> : [];
  return <div className="mt-5 space-y-3"><Module title="Darbu plāns" subtitle="Pozīcija, apjoms, stundas, cilvēki un dienu intervāls"><WorkPlanTable rows={workPlan} /></Module><Module title="Dienas plāns" subtitle="Dienas Nr., plāns, datums, darba nedēļa, izpilde un dalībnieki"><DailyPlanTable rows={dailyPlan} /></Module></div>;
}

function ReferenceTable({rows, fields, settingsKey, onChange}: {rows: Array<Record<string, unknown>>; fields: Array<{key: string; label: string}>; settingsKey: string; onChange: (index: number, key: string, value: string) => void}) {
  return <div className="overflow-x-auto border border-slate-300 bg-white"><table className="min-w-full border-collapse text-sm"><thead className="bg-slate-100"><tr>{fields.map((field) => <th key={field.key} className="border border-slate-300 px-2 py-2 text-left text-xs font-bold text-slate-700">{field.label}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={`${settingsKey}-${index}`} className="odd:bg-white even:bg-slate-50">{fields.map((field) => <td key={field.key} className="border border-slate-200 px-2 py-1"><EditableText value={row[field.key]} onChange={(value) => onChange(index, `${settingsKey}.${field.key}`, value)} className={field.key === 'name' || field.key === 'position' || field.key === 'description' || field.key === 'supplier' ? 'min-w-56' : 'w-28'} /></td>)}</tr>)}</tbody></table></div>;
}

function ReferenceSettingsPanels({outputs, onChange, onSave}: {outputs: CrmEstimatorEngineOutputs; onChange: (output: keyof CrmEstimatorEngineOutputs, index: number, key: string, value: string) => void; onSave: () => void}) {
  const settings = outputs.settings || {};
  const materials = (settings.materialPrices as Array<Record<string, unknown>> | undefined) || [];
  const workRates = (settings.workRates as Array<Record<string, unknown>> | undefined) || [];
  const sheetDetails = (settings.sheetMetalDetails as Array<Record<string, unknown>> | undefined) || [];
  const slopes = (settings.slopeCoefficients as Array<Record<string, unknown>> | undefined) || [];
  const edit = (index: number, key: string, value: string) => onChange('settings', index, key, value);
  return <div className="space-y-3"><div className="flex justify-end"><button type="button" onClick={onSave} className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white">Saglabāt universālos iestatījumus</button></div><Module title="Materiālu cenas - pilns katalogs" subtitle="Visas šūnas ir rediģējamas; cena ar PVN tiek izmantota piedāvājuma aprēķinā"><ReferenceTable rows={materials} settingsKey="materialPrices" fields={[{key: 'name', label: 'Pozīcija'}, {key: 'unit', label: 'Mērvienība'}, {key: 'priceExVat', label: 'Cena/vienība bez PVN'}, {key: 'vatRate', label: 'PVN likme'}, {key: 'priceWithVat', label: 'Cena ar PVN'}, {key: 'supplier', label: 'Piegādātājs'}]} onChange={edit} /></Module><Module title="Ch pozīcijas - pilns katalogs" subtitle="Darba norma un uzcenojums tiek izmantoti F2 darba aprēķinos"><ReferenceTable rows={workRates} settingsKey="workRates" fields={[{key: 'category', label: 'Kategorija'}, {key: 'description', label: 'Pozīcija'}, {key: 'unit', label: 'Mērvienība'}, {key: 'hoursPerUnit', label: 'h/vienību'}, {key: 'rate', label: 'Stundas likme'}, {key: 'markup', label: 'Uzcenojums'}]} onChange={edit} /></Module><Module title="Skārda detaļas - pilns katalogs" subtitle="Detaļu formulas un locīšanas izmaksas"><ReferenceTable rows={sheetDetails} settingsKey="sheetMetalDetails" fields={[{key: 'category', label: 'Dzega'}, {key: 'name', label: 'Nosaukums'}, {key: 'layoutWidth', label: 'Izklājuma platums'}, {key: 'foldCount', label: 'Locījumu skaits'}, {key: 'rukkiPrice', label: 'Rukki'}, {key: 'zincPrice', label: 'Zn'}, {key: 'perforatedPrice', label: 'Perforēts'}, {key: 'rukki06Price', label: 'Rukki 0.6'}, {key: 'foldingPricePerFold', label: 'Locīšana'}]} onChange={edit} /></Module><Module title="Slīpuma koeficienti" subtitle="Šūnas tiek izmantotas, lai 2D platību pārvērstu faktiskajā jumta plaknes platībā"><ReferenceTable rows={slopes} settingsKey="slopeCoefficients" fields={[{key: 'angle', label: 'Leņķis (°)'}, {key: 'multiplier', label: 'Reizināt 2D laukumu ar'}]} onChange={edit} /></Module></div>;
}

function WorkbookOutputSections({outputs, leadId, onChange}: {outputs: CrmEstimatorEngineOutputs; leadId: string; onChange: (output: keyof CrmEstimatorEngineOutputs, index: number, key: string, value: string) => void}) {
  const offerRows = outputRows(outputs.customerOffer, 'activeLineItems');
  const f2Rows = outputRows(outputs.f2Estimate, 'activeRows');
  const materials = outputs.materialsToUse && Array.isArray(outputs.materialsToUse.consolidatedMaterials) ? outputs.materialsToUse.consolidatedMaterials as Array<Record<string, unknown>> : [];
  const tasks = outputs.workPlan && Array.isArray(outputs.workPlan.tasks) ? outputs.workPlan.tasks as Array<Record<string, unknown>> : [];
  const dailyTasks = outputRows(outputs.dailyWorkLog, 'tasks');
  const offerTotals = outputs.customerOffer?.totals as Record<string, unknown> | undefined;
  const f2Totals = outputs.f2Estimate?.totals as Record<string, unknown> | undefined;
  const downloads = [['offer', 'Piedāvājums'], ['f2', 'F2 forma'], ['materials', 'Materiāli'], ['work-plan', 'Darbu plāns'], ['daily-plan', 'Dienas plāns'], ['mechanisms', 'Mehānismi']];
  return <div className="mt-5 space-y-3"><div className="flex flex-wrap gap-2">{downloads.map(([kind, label]) => <a key={kind} href={`/api/estimator/${encodeURIComponent(leadId)}/pdf?kind=${kind}`} className="rounded-lg bg-sky-700 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-800">Lejupielādēt {label} PDF</a>)}</div><Module title="Piedāvājums" subtitle="MATERIĀLU UN IZMAKSU SARAKSTS"><div className="border-b border-slate-300 px-3 py-4"><h2 className="text-xl font-semibold tracking-wide text-slate-700">MATERIĀLU UN IZMAKSU SARAKSTS</h2><p className="mt-1 text-sm text-slate-500">UpRoof.EU · SIA UpLift · būvkomersanta reģistrācijas Nr. 18223</p></div><OfferTable rows={offerRows} onChange={(index, key, value) => onChange('customerOffer', index, key, value)} /><div className="grid gap-4 border-t border-slate-300 p-4 text-sm sm:grid-cols-2"><div><p>Darba devēja VSAOI: {eur(offerTotals?.employerTax)}</p><p>Virsizdevumi: {eur(offerTotals?.overhead)}</p><p>Atlaide: {eur(offerTotals?.discount)}</p></div><div className="text-right"><p>Starpsumma: {eur(offerTotals?.subtotal)}</p><p>PVN: {eur(offerTotals?.vat)}</p><p className="text-lg font-bold">Gala summa: {eur(offerTotals?.total)}</p></div></div><div className="border-t border-slate-300 p-4 text-sm text-slate-600">10 GADU GARANTIJA JUMTA RENOVĀCIJAS UN BŪVĒŠANAS DARBIEM UN 50 GADU GARANTIJA MATERIĀLIEM</div></Module><Module title="F2 forma" subtitle="Lokālā tāme Nr.1"><div className="border-b border-black px-3 py-4"><h2 className="text-lg font-bold">Lokālā tāme Nr.1</h2><p className="text-sm text-slate-600">Jumta renovācija · tāme sastādīta pēc projekta datiem</p></div><F2Table rows={f2Rows} onChange={(index, key, value) => onChange('f2Estimate', index, key, value)} /><div className="flex justify-end border-t border-black p-4 text-sm"><div className="space-y-1 text-right"><p>Tiešās izmaksas: {eur(f2Totals?.directCosts)}</p><p>Virsizdevumi: {eur(f2Totals?.overhead)}</p><p>Peļņa: {eur(f2Totals?.profit)}</p><p>Darba devēja soc. nodoklis: {eur(f2Totals?.employerTax)}</p><p>Pavisam kopā bez PVN: {eur(f2Totals?.subtotalExVat)}</p><p>PVN 21%: {eur(f2Totals?.vat)}</p><p className="text-lg font-bold">Kopā ar PVN: {eur(f2Totals?.totalIncVat)}</p></div></div></Module><Module title="Materiālu cenas" subtitle="Rediģējami cenu iestatījumi"><OutputTable title="Materiālu cenas" rows={(outputs.settings?.materialPrices as Array<Record<string, unknown>> | undefined) || materials} nameKey="name" onChange={(index, key, value) => onChange('settings', index, key, value)} /></Module><Module title="Ch pozīcijas" subtitle="Darba likmes un uzcenojums"><OutputTable title="Ch pozīcijas" rows={(outputs.settings?.workRates as Array<Record<string, unknown>> | undefined) || []} nameKey="category" onChange={(index, key, value) => onChange('settings', index, key, value)} /></Module><Module title="Skārda detaļas" subtitle="Skārda detaļu aprēķina cenas"><OutputTable title="Skārda detaļas" rows={(outputs.settings?.sheetMetalDetails as Array<Record<string, unknown>> | undefined) || []} nameKey="name" onChange={(index, key, value) => onChange('settings', index, key, value)} /></Module><Module title="Slīpuma koeficients" subtitle="Jumta slīpuma reizinātājs"><div className="p-4 text-sm text-slate-700">Aktīvais koeficients: <strong>{String(outputs.settings?.slopeCoefficient ?? '1.000')}</strong></div></Module><Module title="Darbu plāns" subtitle="Kopējais darbu grafiks"><OutputTable title="Darbu plāns" rows={tasks} nameKey="task" onChange={(index, key, value) => onChange('workPlan', index, key, value)} /></Module><Module title="Dienas plāns" subtitle="Darbu izpildes uzskaite"><OutputTable title="Dienas plāns" rows={dailyTasks} nameKey="tasks" onChange={(index, key, value) => onChange('dailyWorkLog', index, key, value)} /></Module></div>;
}

function EngineOutputSections({outputs, leadId, onChange}: {outputs: CrmEstimatorEngineOutputs; leadId: string; onChange: (output: keyof CrmEstimatorEngineOutputs, index: number, key: string, value: string) => void}) {
  const materials = outputs.materialsToUse && Array.isArray(outputs.materialsToUse.consolidatedMaterials) ? outputs.materialsToUse.consolidatedMaterials as Array<Record<string, unknown>> : [];
  const tasks = outputs.workPlan && Array.isArray(outputs.workPlan.tasks) ? outputs.workPlan.tasks as Array<Record<string, unknown>> : [];
  const downloads = [['offer', 'Lejupielādēt Piedāvājumu'], ['f2', 'Lejupielādēt F2 formu'], ['materials', 'Lejupielādēt materiālu sarakstu'], ['work-plan', 'Lejupielādēt darbu plānu'], ['daily-plan', 'Lejupielādēt dienas plānu']];
  return <div className="mt-5 space-y-3"><div className="flex flex-wrap gap-2">{downloads.map(([kind, label]) => <a key={kind} href={`/api/estimator/${encodeURIComponent(leadId)}/pdf?kind=${kind}`} className="rounded-lg bg-sky-700 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-800">{label} PDF</a>)}</div><Module title="Piedāvājums" subtitle="Klientam paredzētais piedāvājums"><OutputTable title="Materiālu un izmaksu saraksts" rows={outputRows(outputs.customerOffer, 'activeLineItems')} nameKey="description" onChange={(index, key, value) => onChange('customerOffer', index, key, value)} columns={['Daudz.', 'Apraksts', 'Specifikācija', 'Mērvienība', 'Daudzums', 'Kopā EUR']} /></Module><Module title="F2 forma" subtitle="Lokālā tāme Nr.1"><OutputTable title="Lokālā tāme Nr.1" rows={outputRows(outputs.f2Estimate, 'activeRows')} nameKey="name" onChange={(index, key, value) => onChange('f2Estimate', index, key, value)} columns={['Nr.p.k.', 'Darba nosaukums', 'Mērvienība', 'Daudzums', 'Vienības izmaksas EUR', 'Darba alga EUR', 'Materiāli EUR', 'Mehānismi EUR', 'Kopā EUR']} /></Module><Module title="Materiālu cenas" subtitle="Rediģējami cenu iestatījumi"><OutputTable title="Materiālu cenas" rows={(outputs.settings?.materialPrices as Array<Record<string, unknown>> | undefined) || materials} nameKey="name" onChange={(index, key, value) => onChange('settings', index, key, value)} /></Module><Module title="Ch pozīcijas" subtitle="Darba likmes un uzcenojums"><OutputTable title="Ch pozīcijas" rows={(outputs.settings?.workRates as Array<Record<string, unknown>> | undefined) || []} nameKey="category" onChange={(index, key, value) => onChange('settings', index, key, value)} /></Module><Module title="Skārda detaļas" subtitle="Skārda detaļu aprēķina cenas"><OutputTable title="Skārda detaļas" rows={(outputs.settings?.sheetMetalDetails as Array<Record<string, unknown>> | undefined) || []} nameKey="name" onChange={(index, key, value) => onChange('settings', index, key, value)} /></Module><Module title="Slīpuma koeficients" subtitle="Jumta slīpuma reizinātājs"><div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">Aktīvais koeficients: <strong>{String(outputs.settings?.slopeCoefficient ?? '1.000')}</strong>. Tas reizina 2D jumta platību, lai aprēķinātu slīpo plakni.</div></Module><Module title="Darbu plāns" subtitle="Kopējais darbu grafiks"><OutputTable title="Darbu plāns" rows={tasks} nameKey="task" onChange={(index, key, value) => onChange('workPlan', index, key, value)} /></Module><Module title="Dienas plāns" subtitle="Darbu izpildes uzskaite"><OutputTable title="Dienas plāns" rows={outputRows(outputs.dailyWorkLog, 'tasks')} nameKey="tasks" onChange={(index, key, value) => onChange('dailyWorkLog', index, key, value)} /></Module></div>;
}

function EstimatorWorkflow({locale, project, initialData}: {locale: string; project: CrmProjectRecord; initialData: CrmEstimatorFormData}) {
  const [data, setData] = useState<CrmEstimatorFormData>(initialData || createEmptyCrmEstimatorData());
  const estimatorFieldDefinitions = [...CRM_ESTIMATOR_FIELD_DEFINITIONS, ...CRM_ESTIMATOR_POLICY_FIELD_DEFINITIONS];
  const estimatorFieldSections = [...CRM_ESTIMATOR_FIELD_SECTIONS, 'Estimator policy'];
  const [showLeadNavigator, setShowLeadNavigator] = useState(false);
  const [tameRows, setTameRows] = useState<CrmEstimatorTameRow[]>(initialData.tameRows || []);
  const [version, setVersion] = useState(project.updatedAtUtc);
  const [rows, setRows] = useState<ProcessedEstimatorRow[]>(initialData.processedRows || []);
  const [finalised, setFinalised] = useState(initialData.processingStatus === 'finalised');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [engineOutputs, setEngineOutputs] = useState<CrmEstimatorEngineOutputs>(initialData.engineOutputs || {});
  const initialSettingsRevision = String(initialData.engineOutputs?.settingsRevision || initialData.engineOutputs?.settings?.revision || '');
  const initialProcessingStatus = initialData.processingStatus;

  useEffect(() => {
    fetch('/api/estimator/settings', {cache: 'no-store'}).then((response) => response.json()).then((result) => {
      if (result.ok) {
        if (initialSettingsRevision && result.revision && initialSettingsRevision !== result.revision && initialProcessingStatus !== 'draft') {
          setMessage('Universālie iestatījumi ir mainīti. Pārstrādājiet tāmi; iepriekšējā versija paliks pieejama PDF lejupielādei.');
        }
        setEngineOutputs((current) => ({...current, settings: result.settings}));
      }
    }).catch(() => undefined);
  }, [initialProcessingStatus, initialSettingsRevision]);

  const update = <K extends keyof CrmEstimatorFormData>(key: K, value: CrmEstimatorFormData[K]) => setData((current) => ({...current, [key]: value}));
  const missing = requiredEstimatorKeys.filter((key) => data[key] === '' || data[key] === null || data[key] === undefined);

  const updateEngineOutput = (output: keyof CrmEstimatorEngineOutputs, index: number, key: string, value: string) => {
    setEngineOutputs((current) => {
      const section = current[output] as Record<string, unknown> | undefined;
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



  const save = async (nextRows = rows, nextStatus: 'draft' | 'processed' | 'finalised' = finalised ? 'finalised' : rows.length > 0 ? 'processed' : 'draft', nextOutputs = engineOutputs, nextTameRows = tameRows) => {
    setError('');
    const response = await fetch(`/api/crm/leads/${encodeURIComponent(project.leadId)}`, {method: 'PATCH', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({updatedAtUtc: version, estimatorData: {...data, tameRows: nextTameRows, engineOutputs: nextOutputs, processedRows: nextRows, processingStatus: nextStatus}})});
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || 'Estimator could not be saved');
    setVersion(result.lead.updatedAtUtc);
  };

  const saveUniversalSettings = async () => {
    const response = await fetch('/api/estimator/settings', {method: 'PATCH', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({settings: engineOutputs.settings})});
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || 'Neizdevās saglabāt universālos iestatījumus');
    setEngineOutputs((current) => ({...current, settings: result.settings}));
    setMessage('Universālie iestatījumi saglabāti');
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
        body: JSON.stringify({estimatorData: {...data, tameRows, engineOutputs}}),
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
      
      const nextOutputs = {
        ...(result.outputs as CrmEstimatorEngineOutputs),
        settingsRevision: String(result.outputs?.settings?.revision || result.outputs?.settingsRevision || ''),
        previousRuns: engineOutputs.customerOffer
          ? [...(engineOutputs.previousRuns || []), {savedAt: new Date().toISOString(), settingsRevision: engineOutputs.settingsRevision, outputs: engineOutputs as Record<string, unknown>}].slice(-5)
          : engineOutputs.previousRuns,
      } as CrmEstimatorEngineOutputs;
      await save(nextRows, 'processed', nextOutputs, tameRows);
      setRows(nextRows);
      setEngineOutputs(nextOutputs);
      setFinalised(false);
      setMessage('Estimate generated. Review and edit the output rows before finalising.');
    } catch (processError: any) {
      setError(processError?.message || 'Estimator could not be processed');
    }
  };

  const addTameRow = () => setTameRows((current) => [...current, calculateEstimatorTameRow({category: '', name: '', specification: '', quantity: '', reserve: '1', quantityWithReserve: '', unit: 'm²', materialUnitPrice: '', materialTotal: '', hoursPerUnit: '', workUnit: 'h', workHours: '', hourlyRate: '18', laborUnitPrice: '', laborTotal: '', laborHoursWithMarkup: '', laborTotalWithMarkup: '', totalWorkMaterials: '', positionMaterials: '', positionWork: '', positionDuration: '', positionTotal: '', mechanisms: ''})]);
  const updateTameRow = (index: number, key: keyof CrmEstimatorTameRow, value: string) => setTameRows((current) => current.map((row, rowIndex) => rowIndex === index ? calculateEstimatorTameRow({...row, [key]: value}) : row));

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
    ['tame', 'Tāme'],
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
  {showLeadNavigator ? <EstimatorLeadNavigator data={data} onClose={() => setShowLeadNavigator(false)} /> : null}
  <button type="button" onClick={() => setShowLeadNavigator(true)} className="fixed left-0 top-1/2 z-30 -translate-y-1/2 rounded-r-xl bg-sky-700 px-2 py-4 text-xs font-bold text-white shadow-lg [writing-mode:vertical-rl]" aria-label="Open CRM lead summary">CRM lead</button>
  <div className="mb-3 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3"><a href={`/${locale}/admin/project-360/${encodeURIComponent(project.leadId)}/workbook`} className="rounded-lg bg-sky-700 px-3 py-2 text-xs font-semibold text-white">Atvērt pilno workbook estimator</a>{estimatorPages.map(([id, label]) => <button key={id} type="button" onClick={() => document.getElementById(id)?.scrollIntoView({behavior: 'smooth', block: 'start'})} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-sky-400 hover:text-sky-700">{label}</button>)}</div>
  <Module title="Estimator data" subtitle="Lead inputs, processing and final outputs">
    <div className="mb-5 rounded-xl border border-sky-100 bg-sky-50 p-4 text-sm text-slate-700">Enter or update the CRM lead data points below, then click &quot;Process estimate&quot; to generate the output documents.</div>
    <div className="rounded-xl border border-slate-200 bg-white p-4"><h3 className="text-sm font-bold text-slate-900">CRM lead data and estimator policy</h3><p className="mt-1 text-xs text-slate-500">CRM lead values are loaded from the database. Edit lead data in CRM; estimator policy is local to this estimate.</p>{estimatorFieldSections.map((section) => <div key={section} className="border-b border-slate-200 py-4 last:border-b-0"><h4 className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">{section}</h4><div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{estimatorFieldDefinitions.filter((definition) => definition.section === section).map((definition) => { const fieldValue = data[definition.key]; const inputId = `project-estimator-${String(definition.key)}`; const isRequired = requiredEstimatorKeys.includes(definition.key); const isCrmLeadField = definition.section !== 'Estimator policy'; return <label key={definition.key} htmlFor={inputId} className="flex flex-col gap-1 text-sm font-medium text-slate-700"><span>{definition.label}{isRequired ? <span className="text-rose-600"> *</span> : null}</span>{definition.type === 'select' ? <select id={inputId} disabled={isCrmLeadField} value={formatEstimatorValue(fieldValue)} onChange={(event) => update(definition.key, event.target.value as never)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-slate-900 disabled:bg-slate-100 disabled:text-slate-600"><option value="">Select</option>{definition.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : definition.type === 'boolean' ? <select id={inputId} disabled={isCrmLeadField} value={fieldValue === null ? '' : fieldValue ? 'true' : 'false'} onChange={(event) => update(definition.key, event.target.value === 'true' ? true : event.target.value === 'false' ? false : null as never)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-slate-900 disabled:bg-slate-100 disabled:text-slate-600"><option value="">Select</option>{CRM_ESTIMATOR_BOOLEAN_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : definition.type === 'number' ? <input id={inputId} type="number" readOnly={isCrmLeadField} value={fieldValue === null ? '' : String(fieldValue)} onChange={(event) => update(definition.key, event.target.value ? Number(event.target.value) as never : null as never)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-slate-900 read-only:bg-slate-100 read-only:text-slate-600" /> : definition.type === 'textarea' ? <textarea id={inputId} readOnly={isCrmLeadField} value={formatEstimatorValue(fieldValue)} onChange={(event) => update(definition.key, event.target.value as never)} rows={2} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 read-only:bg-slate-100 read-only:text-slate-600" /> : <input id={inputId} readOnly={isCrmLeadField} value={formatEstimatorValue(fieldValue)} onChange={(event) => update(definition.key, event.target.value as never)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-slate-900 read-only:bg-slate-100 read-only:text-slate-600" />}</label>; })}</div></div>)}</div>

    <div className="mt-5 flex flex-wrap items-center gap-3"><button type="button" onClick={() => void process()} className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700">Process estimate</button>{missing.length > 0 ? <span className="text-sm text-amber-700">{missing.length} required field{missing.length === 1 ? '' : 's'} remaining</span> : null}</div>
    {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}{message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}
    {rows.length > 0 ? <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-sm font-bold text-slate-900">Processed output</h3><p className="mt-1 text-xs text-slate-500">Edit the rows before finalising the client documents.</p></div><button type="button" onClick={() => void finalise()} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">{finalised ? 'Finalised' : 'Finalise estimate'}</button></div><div className="mt-4 overflow-x-auto"><table className="min-w-full"><thead><tr>{['Description', 'Quantity', 'Unit', 'Unit price', 'Total'].map((heading) => <th key={heading} className="px-2 py-2 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{heading}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={`${row.description}-${index}`}><td className="px-2 py-2"><input value={row.description} onChange={(event) => setRows((current) => current.map((entry, rowIndex) => rowIndex === index ? {...entry, description: event.target.value} : entry))} className="h-9 min-w-52 rounded border border-slate-200 px-2 text-sm" /></td><td className="px-2 py-2"><input value={row.quantity} onChange={(event) => setRows((current) => current.map((entry, rowIndex) => rowIndex === index ? {...entry, quantity: event.target.value} : entry))} className="h-9 w-24 rounded border border-slate-200 px-2 text-sm" /></td><td className="px-2 py-2"><input value={row.unit} onChange={(event) => setRows((current) => current.map((entry, rowIndex) => rowIndex === index ? {...entry, unit: event.target.value} : entry))} className="h-9 w-24 rounded border border-slate-200 px-2 text-sm" /></td><td className="px-2 py-2"><input value={row.price} onChange={(event) => setRows((current) => current.map((entry, rowIndex) => rowIndex === index ? {...entry, price: event.target.value, total: event.target.value && row.quantity ? String(Number(event.target.value) * Number(row.quantity)) : ''} : entry))} className="h-9 w-28 rounded border border-slate-200 px-2 text-sm" /></td><td className="px-2 py-2"><input value={row.total} onChange={(event) => setRows((current) => current.map((entry, rowIndex) => rowIndex === index ? {...entry, total: event.target.value} : entry))} className="h-9 w-28 rounded border border-slate-200 px-2 text-sm" /></td></tr>)}</tbody></table></div>{finalised ? <div className="mt-4 flex flex-wrap gap-2"><a href={`/api/estimator/${encodeURIComponent(project.leadId)}/pdf?kind=f2`} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700">Download F2 forma</a><a href={`/api/estimator/${encodeURIComponent(project.leadId)}/pdf?kind=offer`} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700">Download Piedāvājums</a><a href={`mailto:?subject=${encodeURIComponent(`Piedāvājums - ${project.title}`)}`} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700">Send to client email</a></div> : null}</div> : null}
  </Module>
  <TameInputModule rows={tameRows} onChange={updateTameRow} onAdd={addTameRow} />
  <WorkbookOutputSections leadId={project.leadId} outputs={engineOutputs} onChange={updateEngineOutput} />
  <WorkbookPlanSections outputs={engineOutputs} />
  <ReferenceSettingsPanels outputs={engineOutputs} onChange={updateEngineOutput} onSave={() => void saveUniversalSettings()} />
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

function EstimateOptionsModule({leadId}: {leadId: string}) {
  const options = ['ECO', 'OPTIMAL', 'LUX'];
  const [descriptions, setDescriptions] = useState<Record<string, string>>({});
  return <Module title="Estimates" subtitle="Prepare and send one of three workbook-based offer options">
    <div className="grid gap-4 md:grid-cols-3">
      {options.map((option) => <div key={option} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-bold text-slate-900">{option}</h3><span className="text-xs text-slate-500">Offer PDF</span></div>
        <label className="mt-3 block text-xs font-semibold text-slate-500">Description<textarea value={descriptions[option] || ''} onChange={(event) => setDescriptions((current) => ({...current, [option]: event.target.value}))} rows={3} placeholder={`Describe the ${option} option`} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm font-normal text-slate-900" /></label>
        <div className="mt-3 flex flex-wrap gap-2"><a href={`/api/estimator/${encodeURIComponent(leadId)}/pdf?kind=offer`} className="button primary text-xs">Download PDF</a><label className="button cursor-pointer text-xs">Attach PDF<input type="file" accept="application/pdf" className="hidden" /></label></div>
      </div>)}
    </div>
  </Module>;
}

function ProjectManagementModule() {
  return <Module title="Project management" subtitle="">
    <div className="grid gap-3 md:grid-cols-3">
      {['Work plan by position', 'Daily work plan', 'Work progress'].map((title) => <details key={title} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer text-sm font-bold text-slate-900">{title}</summary></details>)}
    </div>
  </Module>;
}

function SupplyManagementModule() {
  return <Module title="Supply management" subtitle="">
    <div className="grid gap-3 md:grid-cols-3">{['Material list', 'Total lines', 'Production list'].map((title) => <div key={title} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><span className="block text-sm font-bold text-slate-900">{title}</span><span className="mt-2 block text-xs text-slate-500">No entries yet</span></div>)}</div>
  </Module>;
}

function ProjectCashFlowModule({locale, project}: {locale: string; project: CrmProjectRecord}) {
  const cashFlow = project.estimatorData.engineOutputs?.cashFlow as Record<string, unknown> | undefined;
  return <Module title="Project cash flow" subtitle=""><div className="grid gap-3 md:grid-cols-3"><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><span className="text-xs text-slate-500">Project value</span><strong className="mt-1 block text-sm text-slate-900">{project.budget || '—'}</strong></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><span className="text-xs text-slate-500">Cash flow data</span><strong className="mt-1 block text-sm text-slate-900">{cashFlow ? 'Available' : '—'}</strong></div></div></Module>;
}

function ProfitabilityModule({project}: {project: CrmProjectRecord}) {
  const summary = project.estimatorData.engineOutputs?.costSummary as Record<string, unknown> | undefined;
  const metrics: Array<[string, string]> = [['Estimated materials', displayValue(summary?.materials)], ['Estimated labor', displayValue(summary?.labor)], ['Actual OCR costs', displayValue(summary?.actualCosts)], ['Result', displayValue(summary?.profit)]];
  return <Module title="Profitability" subtitle="Estimate and OCR actuals"><div className="grid gap-3 md:grid-cols-4">{metrics.map(([label, value]) => <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><span className="text-xs text-slate-500">{label}</span><strong className="mt-1 block text-sm text-slate-900">{displayValue(value)}</strong></div>)}</div></Module>;
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

        <section className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Lead info</p><p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-sky-600">{project.id}</p><h1 className="mt-1 text-xl font-bold text-slate-900">{project.title}</h1><p className="mt-1 text-sm text-slate-600">{project.customer}{project.company ? ` · ${project.company}` : ''}</p></div><span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">{project.phase}</span></div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2"><label className="block text-sm"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Overview</span><input value={projectOverview} onChange={(event) => setProjectOverview(event.target.value)} className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900" /></label><label className="block text-sm"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Description</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={1} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900" /></label></div>
          <div className="mt-4 grid gap-2 sm:grid-cols-4">{[['Client', project.customer], ['Location', project.location], ['Owner', project.owner], ['Value', project.budget]].map(([label, entry]) => <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 truncate text-sm font-semibold text-slate-900">{entry || '—'}</p></div>)}</div>
        </section>

        <div className="mt-5 space-y-3">
          <Module title="Client and project overview" subtitle="">
            <div className="grid gap-4 md:grid-cols-2"><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><h2 className="text-sm font-bold text-slate-900">Client data</h2><div className="mt-3 space-y-3">{[['Full name / company', project.customer + (project.company ? ` / ${project.company}` : '')], ['Legal address', project.location], ['ID No.', '—'], ['Primary contact', project.owner]].map(([label, entry]) => <label key={label} className="block text-sm"><span className="text-xs text-slate-500">{label}</span><input value={entry || ''} readOnly className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900" /></label>)}</div></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><h2 className="text-sm font-bold text-slate-900">Project data</h2><div className="mt-3 space-y-3"><label className="block text-sm"><span className="text-xs text-slate-500">Project name</span><input value={projectTitle} onChange={(event) => setProjectTitle(event.target.value)} className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900" /></label><label className="block text-sm"><span className="text-xs text-slate-500">Status</span><select value={projectStatus} onChange={(event) => setProjectStatus(event.target.value)} className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900"><option>In Progress</option><option>Scheduled</option><option>Completed</option></select></label><label className="block text-sm"><span className="text-xs text-slate-500">Start date</span><input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900" /></label><label className="block text-sm"><span className="text-xs text-slate-500">End date</span><input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900" /></label><label className="block text-sm"><span className="text-xs text-slate-500">Commercial source</span><input value="Sales CRM — Won" readOnly className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-slate-100 px-2 text-sm text-slate-700" /></label></div></div></div>
          </Module>

          <Link href={`/${locale}/admin/project-360/${encodeURIComponent(project.leadId)}/workbook`} className="flex w-full items-center justify-between rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-200"><span>Estimator</span><span aria-hidden="true">→</span></Link>

          <EstimateOptionsModule leadId={project.leadId} />
          <ProjectManagementModule />
          <SupplyManagementModule />
          <ProjectDocumentsModule project={project} initialDocuments={documents} />
          <ProjectCashFlowModule locale={locale} project={project} />
          <ProfitabilityModule project={project} />

        </div>
      </div>
    </div>
  );
}
