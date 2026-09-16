'use client';

import { useEstimate } from '@/ui/state/EstimateContext';

/** Binding helper: current value (derived values come from the last calculation) and setter. */
export function useInputField(key: string) {
  const { lead, outputs, schema, setInput } = useEstimate();
  const def = schema.find((d) => d.k === key);
  const derived = !!def?.d;
  const raw = derived ? outputs?.inputs[key] : lead?.inputs[key];
  return {
    def,
    derived,
    value: typeof raw === 'number' ? raw : null,
    text: typeof raw === 'string' ? raw : '',
    set: (v: number | null) => setInput(key, v),
    setText: (v: string) => setInput(key, v),
  };
}
