'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  api, emptyOverrides, type ApiError, type EstimateOutputs, type InputDef, type InputValue, type Lead, type LeadTerms,
  type OfferTemplate, type SavedEstimate, type SettingsOverrides, type SettingsSnapshot,
} from '@/ui/api';

type Status = 'loading' | 'ready' | 'calculating' | 'error';
export type OverrideKind = keyof SettingsOverrides;

interface EstimateContextValue {
  leadId: string;
  status: Status;
  error: ApiError | null;
  settings: SettingsSnapshot | null;
  schema: InputDef[];
  offerTemplate: OfferTemplate | null;
  lead: Lead | null;
  overrides: SettingsOverrides;
  overrideCount: number;
  outputs: EstimateOutputs | null;
  savedEstimates: SavedEstimate[];
  setInput(key: string, value: InputValue): void;
  setTerm<K extends keyof LeadTerms>(key: K, value: LeadTerms[K]): void;
  setOverride(kind: OverrideKind, id: string, value: number | null): void;
  resetOverrides(): void;
  setLeadTime(lineId: string, days: number | null): void;
  publishOverrides(note: string): Promise<void>;
  saveEstimate(): Promise<SavedEstimate>;
  saveLeadData(): Promise<void>;
  reloadLead(): Promise<void>;
  setDayTracking(dayNo: number, value: {crew?: string; hours?: string; done?: boolean; note?: string}): void;
  setToolPacked(key: string, packed: boolean): void;
  offerEdits: Record<number, {description?: string; specification?: string; unit?: string; quantity?: number; amount?: number}>;
  offerFinalised: boolean;
  setOfferEdit(line: number, edit: {description?: string; specification?: string; unit?: string; quantity?: number; amount?: number}): void;
  finaliseOffer(): void;
}

const Ctx = createContext<EstimateContextValue | null>(null);
const RECALC_DELAY_MS = 250;
const REQUIRED_INPUT_KEYS = ['crew_size', 'rafter_spacing_m', 'cross_batten_width_m'];

export function EstimateProvider({ leadId, children }: { leadId: string; children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<ApiError | null>(null);
  const [settings, setSettings] = useState<SettingsSnapshot | null>(null);
  const [schema, setSchema] = useState<InputDef[]>([]);
  const [offerTemplate, setOfferTemplate] = useState<OfferTemplate | null>(null);
  const [lead, setLead] = useState<Lead | null>(null);
  const [outputs, setOutputs] = useState<EstimateOutputs | null>(null);
  const [savedEstimates, setSavedEstimates] = useState<SavedEstimate[]>([]);
  const [offerEdits, setOfferEdits] = useState<EstimateContextValue['offerEdits']>({});
  const [offerFinalised, setOfferFinalised] = useState(false);
  const requestId = useRef(0);
  const loaded = useRef(false);
  const offerStateLoaded = useRef(false);

  // Load settings, schema, template and the lead from the backend.
  useEffect(() => {
    let cancelled = false;
    loaded.current = false;
    setStatus('loading');
    Promise.all([api.getActiveSettings(), api.getInputSchema(), api.getOfferTemplate(), api.getLead(leadId), api.listEstimates(leadId)])
      .then(([s, sc, tpl, l, runs]) => {
        if (cancelled) return;
        setSettings(s); setSchema(sc); setOfferTemplate(tpl); setSavedEstimates(runs);
        setLead({ ...l, overrides: { ...emptyOverrides(), ...(l.overrides ?? {}) } });
        setOfferEdits(l.offerEdits || l.crmEstimatorData?.engineOutputs?.offerEdits || {});
        setOfferFinalised(l.offerFinalised === true || l.crmEstimatorData?.engineOutputs?.offerFinalised === true);
        offerStateLoaded.current = true;
      })
      .catch((e: ApiError) => { if (!cancelled) { setError(e); setStatus('error'); } });
    return () => { cancelled = true; };
  }, [leadId]);

  // Debounced: save the lead and ask the server to recalculate.
  useEffect(() => {
    if (!settings || !lead) return;
    const id = ++requestId.current;
    setStatus((s) => (s === 'loading' ? s : 'calculating'));
    const timer = setTimeout(() => {
      const hasRequiredInputs = REQUIRED_INPUT_KEYS.every((key) => {
        const value = lead.inputs[key];
        return typeof value === 'number' && value > 0;
      });
      if (!hasRequiredInputs) {
        if (id === requestId.current) {
          setOutputs(null);
          setError(null);
          setStatus('ready');
        }
        if (loaded.current) api.saveLead(lead).catch((e: ApiError) => setError(e));
        loaded.current = true;
        return;
      }
      api.previewEstimate(leadId, { overrides: lead.overrides, inputs: lead.inputs, terms: lead.terms, leadTimes: lead.leadTimes })
        .then((out) => { if (id === requestId.current) { setOutputs(out); setError(null); setStatus('ready'); } })
        .catch((e: ApiError) => { if (id === requestId.current) { setError(e); setStatus('error'); } });
      if (loaded.current) api.saveLead(lead).catch((e: ApiError) => setError(e));
      loaded.current = true;
    }, RECALC_DELAY_MS);
    return () => clearTimeout(timer);
  }, [leadId, settings, lead]);

  const update = useCallback((fn: (l: Lead) => Lead) => setLead((l) => (l ? fn(l) : l)), []);

  const setInput = useCallback((key: string, value: InputValue) => update((l) => ({ ...l, inputs: { ...l.inputs, [key]: value } })), [update]);
  const setTerm = useCallback(<K extends keyof LeadTerms>(key: K, value: LeadTerms[K]) => update((l) => ({ ...l, terms: { ...l.terms, [key]: value } })), [update]);

  const setOverride = useCallback((kind: OverrideKind, id: string, value: number | null) => update((l) => {
    const bag = { ...l.overrides[kind] } as Record<string, number | null>;
    const base = baseValue(settings, kind, id);
    if (value === base || (value === null && base === null)) delete bag[id];
    else bag[id] = value;
    return { ...l, overrides: { ...l.overrides, [kind]: bag } };
  }), [settings, update]);

  const resetOverrides = useCallback(() => update((l) => ({ ...l, overrides: emptyOverrides() })), [update]);

  const setLeadTime = useCallback((lineId: string, days: number | null) => update((l) => {
    const leadTimes = { ...l.leadTimes };
    if (days === null) delete leadTimes[lineId]; else leadTimes[lineId] = days;
    return { ...l, leadTimes };
  }), [update]);

  /** Turn this estimate's settings edits into a new shared settings version. */
  const publishOverrides = useCallback(async (note: string) => {
    if (!lead) return;
    const o = lead.overrides;
    const materials: Record<string, { price?: number | null; lead_time_days?: number }> = {};
    for (const [k, v] of Object.entries(o.materials)) materials[k] = { ...materials[k], price: v };
    for (const [k, v] of Object.entries(o.materialLeadTimes)) materials[k] = { ...materials[k], lead_time_days: v };
    const next = await api.createSettingsVersion({ note, materials, norms: o.norms as Record<string, number>, coil: o.coil, constants: o.constants });
    setSettings(next);
    update((l) => ({ ...l, overrides: emptyOverrides() }));
  }, [lead, update]);

  const saveEstimate = useCallback(async () => {
    if (lead) await api.saveLead({...lead, offerEdits, offerFinalised});
    const saved = await api.saveEstimate(leadId);
    setSavedEstimates((s) => [saved, ...s]);
    return saved;
  }, [lead, leadId, offerEdits, offerFinalised]);
  const saveLeadData = useCallback(async () => {
    if (lead) await api.saveLead({...lead, offerEdits, offerFinalised});
  }, [lead, offerEdits, offerFinalised]);

  const reloadLead = useCallback(async () => { setLead(await api.getLead(leadId)); }, [leadId]);
  const setDayTracking = useCallback((dayNo: number, value: {crew?: string; hours?: string; done?: boolean; note?: string}) => update((l) => ({...l, dayTracking: {...(l.dayTracking || {}), [dayNo]: value} })), [update]);
  const setToolPacked = useCallback((key: string, packed: boolean) => update((l) => ({...l, toolsPacked: {...(l.toolsPacked || {}), [key]: packed} })), [update]);
  const setOfferEdit = useCallback((line: number, edit: EstimateContextValue['offerEdits'][number]) => {
    setOfferEdits((current) => {
      const next = {...current, [line]: {...current[line], ...edit}};
      return next;
    });
    setOfferFinalised(false);
  }, []);
  const finaliseOffer = useCallback(() => {
    setOfferFinalised(true);
  }, []);

  useEffect(() => {
    if (!offerStateLoaded.current || !lead) return;
    api.saveLead({...lead, offerEdits, offerFinalised}).catch((e: ApiError) => setError(e));
  }, [lead, offerEdits, offerFinalised]);

  const overrideCount = useMemo(() => (lead ? Object.values(lead.overrides).reduce((a, bag) => a + Object.keys(bag).length, 0) : 0), [lead]);

  const value: EstimateContextValue = {
    leadId, status, error, settings, schema, offerTemplate, lead, overrides: lead?.overrides ?? emptyOverrides(), overrideCount, outputs, savedEstimates,
    setInput, setTerm, setOverride, resetOverrides, setLeadTime, publishOverrides, saveEstimate, saveLeadData, reloadLead, setDayTracking, setToolPacked,
    offerEdits, offerFinalised, setOfferEdit, finaliseOffer,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function baseValue(settings: SettingsSnapshot | null, kind: OverrideKind, id: string): number | null {
  if (!settings) return null;
  const v = settings.values;
  switch (kind) {
    case 'materials': return v.materials.find((m) => m.id === id)?.price ?? null;
    case 'materialLeadTimes': return v.materials.find((m) => m.id === id)?.leadTimeDays ?? null;
    case 'norms': return v.norms.find((n) => n.id === id)?.hours ?? null;
    case 'coil': return v.coil[id] ?? null;
    case 'constants': return v.k[id] ?? null;
  }
}

export function useEstimate(): EstimateContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useEstimate must be used inside <EstimateProvider>');
  return ctx;
}

export function useOutputs(): EstimateOutputs | null {
  return useEstimate().outputs;
}
