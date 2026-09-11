'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import type {CrmLead} from '@/lib/crmMockData';
import {CRM_ESTIMATOR_BOOLEAN_OPTIONS, CRM_ESTIMATOR_FIELD_DEFINITIONS, createEmptyCrmEstimatorData, formatEstimatorValue, type CrmEstimatorDetailRow, type CrmEstimatorFormData, type CrmEstimatorSummaryRow} from '@/lib/crmEstimator';

type Props = {locale: string; lead: CrmLead; backHref: string};
type Step = 'crm' | 'tame' | 'summary' | 'adjustments' | 'outputs';
const HIDDEN_KEYS = new Set<keyof CrmEstimatorFormData>(['plannedExecutionTime', 'chimneyRenovation', 'chimneyRenovationCount', 'chimneySheetCladding', 'chimneySheetCladdingCount', 'chimneyCaps', 'chimneyCapsCount']);

function DetailRows({rows, onChange}: {rows: CrmEstimatorDetailRow[]; onChange: (index: number, key: keyof CrmEstimatorDetailRow, value: string) => void}) {
  const fields: Array<keyof CrmEstimatorDetailRow> = ['category', 'name', 'specification', 'quantity', 'reserve', 'unit', 'notes'];
  return <div className="mt-4 overflow-x-auto"><table className="min-w-[900px] w-full text-sm"><thead><tr>{['Kategorija', 'Pozīcija', 'Specifikācija', 'Daudzums', 'Rezerve', 'Mērvienība', 'Piezīmes'].map((label) => <th key={label} className="border border-slate-200 bg-slate-100 px-2 py-2 text-left">{label}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{fields.map((field) => <td key={field} className="border border-slate-200 p-1"><input value={row[field]} onChange={(event) => onChange(index, field, event.target.value)} className="h-8 w-full min-w-24 border-0 px-1" /></td>)}</tr>)}</tbody></table></div>;
}

function SummaryRows({rows, onChange}: {rows: CrmEstimatorSummaryRow[]; onChange: (index: number, key: keyof CrmEstimatorSummaryRow, value: string) => void}) {
  const fields: Array<keyof CrmEstimatorSummaryRow> = ['category', 'constructionElement', 'measurement', 'quantity', 'unit', 'notes'];
  return <div className="mt-4 overflow-x-auto"><table className="min-w-[800px] w-full text-sm"><thead><tr>{['Kategorija', 'Konstrukcijas elements', 'Mērījums', 'Daudzums', 'Mērvienība', 'Piezīmes'].map((label) => <th key={label} className="border border-slate-200 bg-slate-100 px-2 py-2 text-left">{label}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{fields.map((field) => <td key={field} className="border border-slate-200 p-1"><input value={row[field]} onChange={(event) => onChange(index, field, event.target.value)} className="h-8 w-full min-w-24 border-0 px-1" /></td>)}</tr>)}</tbody></table></div>;
}

export default function EstimatorEngineClient({lead, backHref}: Props) {
  const router = useRouter();
  const [data, setData] = useState<CrmEstimatorFormData>(lead.estimatorData || createEmptyCrmEstimatorData());
  const [version, setVersion] = useState(lead.updatedAtUtc);
  const [step, setStep] = useState<Step>('crm');
  const [tameInputs, setTameInputs] = useState(data.tameInputs);
  const [summaryInputs, setSummaryInputs] = useState(data.summaryInputs);
  const [status, setStatus] = useState('');
  const [processing, setProcessing] = useState(false);

  const update = <K extends keyof CrmEstimatorFormData>(key: K, value: CrmEstimatorFormData[K]) => setData((current) => ({...current, [key]: value}));
  const save = async (nextData = {...data, tameInputs, summaryInputs}) => {
    const response = await fetch(`/api/crm/leads/${encodeURIComponent(lead.id)}`, {method: 'PATCH', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({updatedAtUtc: version, estimatorData: nextData})});
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || 'Neizdevās saglabāt tāmi');
    setVersion(result.lead.updatedAtUtc); setStatus('Saglabāts');
  };
  const processEstimate = async () => {
    setProcessing(true); setStatus('');
    try {
      const payload = {...data, tameInputs, summaryInputs};
      const response = await fetch(`/api/crm/leads/${encodeURIComponent(lead.id)}/estimate`, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({estimatorData: payload})});
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || 'Neizdevās apstrādāt tāmi');
      const nextData = {...payload, engineOutputs: result.outputs, processingStatus: 'processed' as const};
      setData(nextData); await save(nextData); setStep('outputs');
    } catch (error) { setStatus(error instanceof Error ? error.message : 'Neizdevās apstrādāt tāmi'); }
    finally { setProcessing(false); }
  };
  const next: Record<Step, Step> = {crm: 'tame', tame: 'summary', summary: 'adjustments', adjustments: 'outputs', outputs: 'outputs'};
  const previous: Record<Step, Step> = {crm: 'crm', tame: 'crm', summary: 'tame', adjustments: 'summary', outputs: 'adjustments'};
  const addTame = () => setTameInputs((rows) => [...rows, {category: '', name: '', specification: '', quantity: '', reserve: '1', unit: 'm²', notes: ''}]);
  const addSummary = () => setSummaryInputs((rows) => [...rows, {category: '', constructionElement: '', measurement: '', quantity: '', unit: 'm²', notes: ''}]);
  const crmFields = <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{CRM_ESTIMATOR_FIELD_DEFINITIONS.filter((definition) => !HIDDEN_KEYS.has(definition.key)).map((definition) => { const value = data[definition.key]; const id = `estimator-${String(definition.key)}`; return <label key={definition.key} htmlFor={id} className="flex flex-col gap-2 text-sm font-medium text-slate-700"><span>{definition.label}</span>{definition.type === 'boolean' ? <select id={id} value={value === null ? '' : value ? 'true' : 'false'} onChange={(event) => update(definition.key, event.target.value === 'true' ? true : event.target.value === 'false' ? false : null as never)} className="h-10 rounded-xl border border-slate-200 px-3"><option value="">Izvēlieties</option>{CRM_ESTIMATOR_BOOLEAN_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : definition.type === 'select' ? <select id={id} value={formatEstimatorValue(value)} onChange={(event) => update(definition.key, event.target.value as never)} className="h-10 rounded-xl border border-slate-200 px-3"><option value="">Izvēlieties</option>{definition.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : <input id={id} type={definition.type === 'number' ? 'number' : 'text'} value={formatEstimatorValue(value)} onChange={(event) => update(definition.key, definition.type === 'number' ? Number(event.target.value) as never : event.target.value as never)} className="h-10 rounded-xl border border-slate-200 px-3" />}</label>; })}</div>;
  const content = step === 'crm' ? <><h2 className="text-lg font-bold">1. Ievade - CRM sākotnējie mērījumi</h2>{crmFields}</> : step === 'tame' ? <><h2 className="text-lg font-bold">2. Tāme - detalizēti ievades dati</h2><p className="mt-1 text-sm text-slate-500">Papildu būvdarbu pozīcijas, kas nepārklājas ar CRM.</p><DetailRows rows={tameInputs} onChange={(index, key, value) => setTameInputs((rows) => rows.map((row, rowIndex) => rowIndex === index ? {...row, [key]: value} : row))} /><button type="button" onClick={addTame} className="mt-3 rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold text-white">Pievienot Tāmes pozīciju</button></> : step === 'summary' ? <><h2 className="text-lg font-bold">3. Kopsavilkums - konstrukciju precizējumi</h2><SummaryRows rows={summaryInputs} onChange={(index, key, value) => setSummaryInputs((rows) => rows.map((row, rowIndex) => rowIndex === index ? {...row, [key]: value} : row))} /><button type="button" onClick={addSummary} className="mt-3 rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold text-white">Pievienot konstrukcijas pozīciju</button></> : step === 'adjustments' ? <><h2 className="text-lg font-bold">4. Korekcijas un koeficienti</h2><p className="mt-2 text-sm text-slate-600">Materiālu cenas, Ch pozīcijas, Skārda detaļas un Slīpuma koeficienti tiek koriģēti pirms apstrādes projekta failā.</p></> : <><h2 className="text-lg font-bold">5. Apstrāde un rezultāti</h2><p className="mt-2 text-sm text-slate-600">Rezultāti tiek saglabāti projekta skatam: Piedāvājums, F2 forma, Darbu plāns, Dienas plāns, Mehānismu saraksts un ekipāžas faktiskā izpilde pret plānu.</p><div className="mt-4 flex gap-2"><a href={`/api/estimator/${encodeURIComponent(lead.id)}/pdf?kind=offer`} className="rounded-lg bg-sky-700 px-3 py-2 text-sm font-semibold text-white">Piedāvājums PDF</a><a href={`/api/estimator/${encodeURIComponent(lead.id)}/pdf?kind=f2`} className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold text-white">F2 forma PDF</a></div></>;
  return <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"><div className="mx-auto max-w-7xl"><div className="mb-5 flex items-center gap-2 text-sm"><button type="button" onClick={() => router.push(backHref)} aria-label="Atpakaļ" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600">←</button><span className="font-semibold text-sky-700">{lead.customer}</span><span className="text-slate-400">/</span><span className="font-semibold text-slate-700">Estimator Engine</span></div><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">{lead.id}</p><h1 className="mt-2 text-2xl font-bold text-slate-900">Estimator Engine</h1><p className="mt-1 text-sm text-slate-600">{lead.customer} · {lead.projectAddress || lead.address}</p></div><button type="button" onClick={() => void save()} className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white">Saglabāt</button></div>{status ? <p className="mt-3 text-sm text-sky-700">{status}</p> : null}</section><nav className="my-5 flex flex-wrap gap-2">{[['crm', 'Ievade'], ['tame', 'Tāme'], ['summary', 'Kopsavilkums'], ['adjustments', 'Korekcijas'], ['outputs', 'Apstrāde']].map(([value, label]) => <button key={value} type="button" onClick={() => setStep(value as Step)} className={`rounded-lg border px-3 py-2 text-sm font-semibold ${step === value ? 'border-sky-600 bg-sky-700 text-white' : 'border-slate-200 bg-white text-slate-700'}`}>{label}</button>)}</nav><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">{content}</section><div className="mt-5 flex justify-between"><button type="button" onClick={() => setStep(previous[step])} className="rounded-lg border border-slate-300 px-4 py-2">Atpakaļ</button><button type="button" onClick={() => step === 'adjustments' ? void processEstimate() : setStep(next[step])} disabled={processing} className="rounded-lg bg-sky-700 px-4 py-2 font-semibold text-white">{processing ? 'Apstrāde...' : step === 'adjustments' ? 'Apstrādāt' : 'Tālāk'}</button></div></div></main>;
}