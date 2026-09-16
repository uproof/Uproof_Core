'use client';

import { useEstimate } from '@/ui/state/EstimateContext';
import { useLocalState } from '@/ui/state/useLocalState';

/** Packing checklist of unique tools. */
export function ToolsDocument() {
  const { outputs, leadId } = useEstimate();
  const [packed, setPacked] = useLocalState<Record<string, boolean>>(`toolsPacked:${leadId}`, {});
  if (!outputs) return null;
  return (
    <ul className="checklist">
      {outputs.tools.map((t) => (
        <li key={t.key}>
          <label>
            <input type="checkbox" checked={!!packed[t.key]} onChange={(e) => setPacked((p) => ({ ...p, [t.key]: e.target.checked }))} />
            <span>{t.name}<small>{t.usedIn.slice(0, 3).join(', ')}{t.usedIn.length > 3 ? ` and ${t.usedIn.length - 3} more` : ''}</small></span>
          </label>
        </li>
      ))}
    </ul>
  );
}
