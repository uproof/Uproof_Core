import { NumberInput, Panel } from '@/workbook-ui/components/common';
import { format2, formatNum } from '@/workbook-ui/lib/format';
import { useEstimate } from '@/workbook-ui/state/EstimateContext';

export const SHEET_VARIANTS: Record<string, string> = { rukki_05: 'Rukki 0.5', zn_05: 'Zn 0.5', perforated_07: 'Perforated 0.7', rukki_06: 'Rukki 0.6' };

/** Profile price per m = blank width × coil price per m² + folds × fold cost. */
export function SheetMetalTab() {
  const { settings, overrides, setOverride } = useEstimate();
  const v = settings!.values;
  const coil = { ...v.coil, ...overrides.coil };
  return (
    <div className="stack">
      <Panel title="Coil prices" titleLv="Ruļļa materiāla cena, €/m²" aside={<span>Fold cost {formatNum(v.fold_cost)} € per fold per m</span>}>
        <div className="field-grid">
          {Object.entries(SHEET_VARIANTS).map(([id, label]) => (
            <label className="field" key={id}>
              <span>{label}</span>
              <NumberInput label={label} value={coil[id]} baseValue={id in overrides.coil ? v.coil[id] : undefined} onChange={(x) => setOverride('coil', id, x)} />
            </label>
          ))}
        </div>
      </Panel>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>Profile</th><th className="num">Blank width, m</th><th className="num">Folds</th>
              {Object.values(SHEET_VARIANTS).map((l) => <th key={l} className="num">€/m {l}</th>)}</tr>
          </thead>
          <tbody>
            {v.sd.map((d) => (
              <tr key={d.id}>
                <td>{d.name}<br /><small>{d.grp}</small></td>
                <td className="num">{formatNum(d.w)}</td>
                <td className="num">{formatNum(d.folds)}</td>
                {Object.keys(SHEET_VARIANTS).map((variant) => (
                  <td key={variant} className="num">{d.has[variant] ? format2((d.w || 0) * coil[variant] + v.fold_cost * (d.folds || 0)) : 'n/a'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
