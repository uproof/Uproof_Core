import { Fragment } from 'react';
import { Paper } from '@/workbook-ui/components/documents/Paper';
import type { F2Row } from '@/workbook-ui/engine';
import { formatDate, formatEur, format2, formatNum, formatPct } from '@/workbook-ui/lib/format';
import { useEstimate } from '@/workbook-ui/state/EstimateContext';
import { useLocalState } from '@/workbook-ui/state/useLocalState';

const FIRST_SECTION = 'Demontāžas darbi';
const hasContent = (r: F2Row) => !!(r.D && (r.K || r.M));
const cell = (v: number | undefined) => (v ? format2(v) : '');

/** Group rows under section headers; optionally drop empty rows and empty sections. */
export function groupF2Rows(rows: F2Row[], hideEmpty: boolean) {
  const sections: { title: string; rows: F2Row[] }[] = [{ title: FIRST_SECTION, rows: [] }];
  for (const r of rows) {
    if (r.header) sections.push({ title: r.header, rows: [] });
    else if (!hideEmpty || hasContent(r)) sections[sections.length - 1].rows.push(r);
  }
  return sections.filter((s) => s.rows.length > 0);
}

/** Lokālā tāme (F2 forma), landscape. */
export function F2Document() {
  const { outputs, lead, leadId } = useEstimate();
  const [hideEmpty] = useLocalState(`f2HideEmpty:${leadId}`, true);
  if (!outputs || !lead) return null;
  const f = outputs.f2;
  const k = outputs.constants;
  let nr = 0;
  return (
    <Paper wide>
      <header className="doc-header">
        <div><h1>Lokālā tāme Nr. 1</h1><p>Jumta renovācijas darbi, {lead.terms.address}</p></div>
        <div className="doc-company">Tāme sastādīta {formatDate(new Date())}<br />Cenas bez PVN, EUR</div>
      </header>
      <table className="doc-table">
        <thead>
          <tr><th rowSpan={2}>Nr.</th><th rowSpan={2}>Darba nosaukums</th><th rowSpan={2}>Mērv.</th><th rowSpan={2} className="num">Daudz.</th><th colSpan={6}>Vienības izmaksas</th><th colSpan={5}>Kopā uz visu apjomu</th></tr>
          <tr><th className="num">c/h</th><th className="num">€/h</th><th className="num">Alga</th><th className="num">Mater.</th><th className="num">Meh.</th><th className="num">Kopā</th><th className="num">c/h</th><th className="num">Alga</th><th className="num">Materiāli</th><th className="num">Meh.</th><th className="num">Kopā</th></tr>
        </thead>
        <tbody>
          {groupF2Rows(f.rows, hideEmpty).map((s) => (
            <Fragment key={s.title}>
              <tr className="row-section"><td /><td colSpan={14}>{s.title}</td></tr>
              {s.rows.map((r) => (
                <tr key={r.row}>
                  <td>{++nr}</td><td>{r.name}</td><td>{r.unit}</td><td className="num">{formatNum(r.D)}</td>
                  <td className="num">{cell(r.E)}</td><td className="num">{r.E ? formatNum(r.F) : ''}</td><td className="num">{cell(r.G)}</td><td className="num">{cell(r.H)}</td><td className="num">{cell(r.I)}</td><td className="num">{format2(r.J)}</td>
                  <td className="num">{cell(r.K)}</td><td className="num">{cell(r.L)}</td><td className="num">{cell(r.M)}</td><td className="num">{cell(r.N)}</td><td className="num">{format2(r.O)}</td>
                </tr>
              ))}
            </Fragment>
          ))}
          <tr className="row-total"><td /><td colSpan={9}>Kopā</td><td className="num">{format2(f.hours)}</td><td className="num">{format2(f.labor)}</td><td className="num">{format2(f.materials)}</td><td className="num">{format2(f.mechanisms)}</td><td className="num">{format2(f.subtotal)}</td></tr>
        </tbody>
      </table>
      <table className="doc-totals">
        <tbody>
          <tr><td>Transporta izdevumi</td><td className="num">{format2(f.transport)}</td></tr>
          <tr><td>Tiešās izmaksas kopā</td><td className="num">{format2(f.direct)}</td></tr>
          <tr><td>Virsizdevumi {formatPct(k.f2_overhead_share)}</td><td className="num">{format2(f.overhead)}</td></tr>
          <tr><td>t.sk. darba aizsardzība {formatPct(k.f2_labor_safety_share_of_overhead)}</td><td className="num">{format2(f.safety)}</td></tr>
          <tr><td>Peļņa {formatPct(k.f2_profit_share)}</td><td className="num">{format2(f.profit)}</td></tr>
          <tr><td>Darba devēja soc. nodoklis {formatPct(k.employer_social_tax_vsaoi)}</td><td className="num">{format2(f.vsaoi)}</td></tr>
          <tr><td>Pavisam kopā bez PVN</td><td className="num">{format2(f.exVat)}</td></tr>
          <tr><td>PVN {formatPct(k.f2_vat_rate)}</td><td className="num">{format2(f.vat)}</td></tr>
          <tr className="grand"><td>Kopā ar PVN</td><td className="num">{formatEur(f.incVat)}</td></tr>
        </tbody>
      </table>
    </Paper>
  );
}
