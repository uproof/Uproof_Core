import { useInputField } from '../useInputField';
import { InputCell } from './InputCell';

function LabelCell({ inputKey }: { inputKey: string }) {
  const f = useInputField(inputKey);
  return <input type="text" aria-label="Kit name" value={f.text} onChange={(e) => f.setText(e.target.value)} />;
}

export function SnowMeltTable() {
  const electrical = useInputField('electrical_install_label');
  return (
    <div className="table-wrap">
      <table className="table">
        <thead><tr><th>Kit</th><th className="num">Cable length, m</th><th className="num">Kit price, € excl. VAT</th></tr></thead>
        <tbody>
          {[1, 2, 3].map((j) => (
            <tr key={j}>
              <td><LabelCell inputKey={`snow_melt_kit_${j}_label`} /></td>
              <td><InputCell inputKey={`snow_melt_kit_${j}_length_m`} /></td>
              <td><InputCell inputKey={`snow_melt_kit_${j}_price`} /></td>
            </tr>
          ))}
          <tr><td>{electrical.text || 'Electrical installation'}</td><td /><td><InputCell inputKey="electrical_install_price" /></td></tr>
        </tbody>
      </table>
    </div>
  );
}
