'use client';

import { Paper } from '@/ui/components/documents/Paper';
import { formatDate, formatEur, format2, formatNum, formatPct } from '@/ui/lib/format';
import { useEstimate } from '@/ui/state/EstimateContext';
import { buildOfferLines, offerFooter } from './offerLayout';

/** Client offer document (Piedāvājums). Printable on its own. */
export function OfferDocument() {
  const { outputs, lead, offerTemplate, offerEdits } = useEstimate();
  if (!outputs || !lead || !offerTemplate) return null;
  const o = outputs.offer;
  const k = outputs.constants;
  const lines = buildOfferLines(o, outputs.inputs, offerTemplate).map((line) => ({...line, ...offerEdits[line.line]}));
  const materialTotal = lines.reduce((sum, line) => sum + Number(line.amount || 0), 0);
  const subtotal = materialTotal + o.labor + o.vsaoi + o.overhead - o.discount;
  const vat = subtotal * o.vatRate;
  const total = subtotal + vat;
  return (
    <Paper>
      <header className="doc-header">
        <div>
          <h1>Materiālu un izmaksu saraksts</h1>
          <p>Jumta renovācijas darbi, {lead.terms.address}</p>
        </div>
        <address className="doc-company">{/* Company details from company profile */}Company name<br />Registration no.<br />Address<br />{formatDate(new Date())}</address>
      </header>
      <table className="doc-table">
        <thead><tr><th>Nr.</th><th>Apraksts</th><th>Specifikācija</th><th>Mērv.</th><th className="num">Daudz.</th><th className="num">Kopā, €</th></tr></thead>
        <tbody>
          {lines.map((l, i) => (
            <tr key={l.line}><td>{i + 1}</td><td>{l.description}</td><td>{l.specification}</td><td>{l.unit}</td><td className="num">{formatNum(l.quantity)}</td><td className="num">{format2(l.amount)}</td></tr>
          ))}
          <tr><td>{lines.length + 1}</td><td>Darbietilpība un darba samaksa pirms nodokļu nomaksas</td><td>{format2(o.hours)} c/h × {formatNum(k.labor_rate_eur_h)} €</td><td>kopā</td><td /><td className="num">{format2(o.labor)}</td></tr>
        </tbody>
      </table>
      <table className="doc-totals">
        <tbody>
          <tr><td>Darba devēja VSAOI {formatPct(k.employer_social_tax_vsaoi)}</td><td className="num">{format2(o.vsaoi)}</td></tr>
          <tr><td>Virsizdevumi {formatPct(k.offer_overhead_share)}</td><td className="num">{format2(o.overhead)}</td></tr>
          {o.discount > 0 && <tr><td>Atlaide</td><td className="num">−{format2(o.discount)}</td></tr>}
          <tr><td>Starpsumma</td><td className="num">{format2(subtotal)}</td></tr>
          <tr><td>PVN {formatPct(o.vatRate)}{o.vatRate === 0 ? ' (apgrieztā maksāšana)' : ''}</td><td className="num">{format2(vat)}</td></tr>
          <tr className="grand"><td>Gala summa</td><td className="num">{formatEur(total)}</td></tr>
        </tbody>
      </table>
      <p><strong>Darbu ilgums:</strong> {o.days} darba dienas.</p>
      <h4>Svarīgi zināt</h4>
      <ol>{offerFooter(offerTemplate).map((t) => <li key={t}>{t}</li>)}</ol>
      <p className="doc-fine">No projekta summas nodokļos: IIN {format2(o.iin)} €, VSAOI {format2(o.vsaoiAll)} €.</p>
    </Paper>
  );
}
