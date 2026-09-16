import { useEstimate } from '@/workbook-ui/state/EstimateContext';
import { FieldGrid } from './FieldGrid';
import { InputCell } from './InputCell';

export function WindowsTable() {
  const { schema } = useEstimate();
  return (
    <>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Window type</th><th className="num">Count</th><th className="num">Window kit, €</th><th className="num">Membrane frame, €</th></tr></thead>
          <tbody>
            {[1, 2].map((j) => (
              <tr key={j}>
                <td>Roof window {j}</td>
                <td><InputCell inputKey={`roof_window_${j}_count`} /></td>
                <td><InputCell inputKey={`roof_window_${j}_kit_price`} /></td>
                <td><InputCell inputKey={`roof_window_${j}_frame_price`} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <FieldGrid defs={schema.filter((d) => d.k === 'roof_window_flashing_length_m' || d.k === 'roof_window_flashing_count')} />
    </>
  );
}
