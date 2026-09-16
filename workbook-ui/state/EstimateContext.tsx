import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { api, emptyOverrides, type EstimateOutputs, type Lead, type SettingsOverrides, type SettingsSnapshot } from '@/workbook-ui/api';
import type { InputDef, InputValue, LeadTerms } from '@/workbook-ui/engine';
import { storage } from '@/workbook-ui/lib/storage';

type Status = 'loading' | 'ready' | 'calculating' | 'error';
type OverrideKind = keyof SettingsOverrides;

interface EstimateContextValue {
  leadId: string;
  status: Status;
  error: string | null;
  settings: SettingsSnapshot | null;
  schema: InputDef[];
  lead: Lead | null;
  overrides: SettingsOverrides;
  overrideCount: number;
  outputs: EstimateOutputs | null;
  setInput(key: string, value: InputValue): void;
  setTerm<K extends keyof LeadTerms>(key: K, value: LeadTerms[K]): void;
  setOverride(kind: OverrideKind, id: string, value: number | null): void;
  resetOverrides(): void;
  resetInputs(): void;
}

const Ctx = createContext<EstimateContextValue | null>(null);
const RECALC_DELAY_MS = 150;

export function EstimateProvider({ leadId, children }: { leadId: string; children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<SettingsSnapshot | null>(null);
  const [schema, setSchema] = useState<InputDef[]>([]);
  const [lead, setLead] = useState<Lead | null>(null);
  const [overrides, setOverrides] = useState<SettingsOverrides>(() => storage.get(`overrides:${leadId}`) ?? emptyOverrides());
  const [outputs, setOutputs] = useState<EstimateOutputs | null>(null);
  const requestId = useRef(0);

  // Load settings snapshot, input schema and lead.
  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    Promise.all([api.getActiveSettings(), api.getInputSchema(), api.getLead(leadId)])
      .then(([s, sc, l]) => { if (!cancelled) { setSettings(s); setSchema(sc); setLead(l); } })
      .catch((e: unknown) => { if (!cancelled) { setError(String(e)); setStatus('error'); } });
    return () => { cancelled = true; };
  }, [leadId]);

  // Recalculate (debounced) whenever inputs, terms or overrides change.
  useEffect(() => {
    if (!settings || !lead) return;
    const id = ++requestId.current;
    setStatus((s) => (s === 'loading' ? s : 'calculating'));
    const timer = setTimeout(() => {
      api.previewEstimate({ leadId, settingsVersionId: settings.version.id, overrides, inputs: lead.inputs, terms: lead.terms })
        .then((out) => { if (id === requestId.current) { setOutputs(out); setStatus('ready'); } })
        .catch((e: unknown) => { if (id === requestId.current) { setError(String(e)); setStatus('error'); } });
      api.saveLead(lead);
      storage.set(`overrides:${leadId}`, overrides);
    }, RECALC_DELAY_MS);
    return () => clearTimeout(timer);
  }, [leadId, settings, lead, overrides]);

  const setInput = useCallback((key: string, value: InputValue) =>
    setLead((l) => (l ? { ...l, inputs: { ...l.inputs, [key]: value } } : l)), []);

  const setTerm = useCallback(<K extends keyof LeadTerms>(key: K, value: LeadTerms[K]) =>
    setLead((l) => (l ? { ...l, terms: { ...l.terms, [key]: value } } : l)), []);

  const setOverride = useCallback((kind: OverrideKind, id: string, value: number | null) => {
    setOverrides((o) => {
      const bag = { ...o[kind] } as Record<string, number | null>;
      const base = baseValue(settings, kind, id);
      if (value === base || (value === null && base === null)) delete bag[id];
      else bag[id] = value;
      return { ...o, [kind]: bag };
    });
  }, [settings]);

  const resetOverrides = useCallback(() => setOverrides(emptyOverrides()), []);

  const resetInputs = useCallback(() => {
    storage.remove(`lead:${leadId}`);
    api.getLead(leadId).then(setLead);
  }, [leadId]);

  const overrideCount = useMemo(() => Object.values(overrides).reduce((a, bag) => a + Object.keys(bag).length, 0), [overrides]);

  const value: EstimateContextValue = {
    leadId, status, error, settings, schema, lead, overrides, overrideCount, outputs,
    setInput, setTerm, setOverride, resetOverrides, resetInputs,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function baseValue(settings: SettingsSnapshot | null, kind: OverrideKind, id: string): number | null {
  if (!settings) return null;
  const v = settings.values;
  switch (kind) {
    case 'materials': return v.materials.find((m) => m.id === id)?.price ?? null;
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

/** For output pages: returns outputs once the first calculation finished. */
export function useOutputs(): EstimateOutputs | null {
  return useEstimate().outputs;
}
