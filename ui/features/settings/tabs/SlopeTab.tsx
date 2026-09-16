'use client';

import { DataTable, Notice, Panel } from '@/ui/components/common';
import type { SlopeRow } from '@/ui/api';
import { formatNum } from '@/ui/lib/format';
import { useEstimate } from '@/ui/state/EstimateContext';

export function interpolateAreaMultiplier(table: SlopeRow[], deg: number): number {
  for (let i = 0; i < table.length - 1; i++) {
    const a = table[i], b = table[i + 1];
    if (deg >= a.angle_deg && deg <= b.angle_deg) return a.area_multiplier + ((b.area_multiplier - a.area_multiplier) * (deg - a.angle_deg)) / (b.angle_deg - a.angle_deg);
  }
  return table[table.length - 1].area_multiplier;
}

/** Reference tables from the "Slīpuma koef" images. Not applied by the engine yet (spec open question 4). */
export function SlopeTab() {
  const { settings, lead } = useEstimate();
  const v = settings!.values;
  const deg = Number(lead?.inputs.roof_slope_deg) || 0;
  const gap = v.gaps.find((g) => deg >= g.from_deg && deg <= g.to_deg);
  return (
    <div className="stack">
      <Notice>
        Not applied by the engine yet. For this roof ({formatNum(deg)}°): area multiplier {formatNum(interpolateAreaMultiplier(v.slope, deg))}, batten gap {gap?.gap_mm ?? '?'} mm.
      </Notice>
      <div className="two-columns">
        <Panel title="Area multiplier" titleLv="Platības koeficients" flush>
          <DataTable rows={v.slope} rowKey={(r) => String(r.angle_deg)} columns={[
            { key: 'a', header: 'Angle', render: (r) => `${r.angle_deg}°` },
            { key: 'm', header: 'Multiply plan area by', align: 'right', render: (r) => r.area_multiplier.toFixed(3) },
          ]} />
        </Panel>
        <Panel title="Batten gap" titleLv="Latojuma sprauga" flush>
          <DataTable rows={v.gaps} rowKey={(g) => `${g.from_deg}`} columns={[
            { key: 's', header: 'Slope', render: (g) => `${g.from_deg} to ${g.to_deg}°` },
            { key: 'g', header: 'Gap, mm', align: 'right', render: (g) => g.gap_mm },
          ]} />
        </Panel>
      </div>
    </div>
  );
}
