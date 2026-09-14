import PDFDocument from 'pdfkit';
import path from 'node:path';
import type {EstimatorOutput} from './estimatorEngine';

const regularFont = path.join(process.cwd(), 'public/fonts/Arial.ttf');
const boldFont = path.join(process.cwd(), 'public/fonts/Arial-Bold.ttf');
const logoPath = path.join(process.cwd(), 'public/logo-pdf.png');

function money(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) ? `${amount.toFixed(2)} €` : '0.00 €';
}

function renderDocument(doc: PDFKit.PDFDocument, output: EstimatorOutput, kind: 'offer' | 'f2', customer: string, address: string) {
  const pageWidth = kind === 'f2' ? 842 : 595;
  const margin = 38;
  const tableWidth = pageWidth - margin * 2;
  doc.font(regularFont).fillColor('#111111');
  doc.image(logoPath, pageWidth - margin - 105, 25, {fit: [105, 42], align: 'right', valign: 'center'});
  doc.moveTo(margin, 62).lineTo(pageWidth - margin, 62).lineWidth(2).strokeColor('#e83c33').stroke();

  if (kind === 'offer') {
    doc.font(boldFont).fontSize(16).fillColor('#222222').text('MATERIĀLU UN IZMAKSU SARAKSTS', margin, 78);
    doc.font(regularFont).fontSize(9).fillColor('#555555').text(`UpRoof.EU | SIA UpLift | būvkomersanta reģistrācijas Nr. 18223`, margin, 101);
    doc.text(`Klients: ${customer} | Objekts: ${address}`, margin, 115);
    let y = 145;
    const widths = [34, 220, 92, 55, 62, 70];
    const headers = ['Daudz.', 'Apraksts', 'Specifikācija', 'Mērv.', 'Daudzums', 'Kopā'];
    const drawHeader = () => {
      doc.rect(margin, y, tableWidth, 22).fill('#eeeeee');
      doc.fillColor('#222222').font(boldFont).fontSize(8);
      let x = margin;
      headers.forEach((header, index) => { doc.text(header, x + 3, y + 7, {width: widths[index] - 6}); x += widths[index]; });
      y += 22;
    };
    drawHeader();
    doc.font(regularFont).fontSize(7.5);
    output.piedāvājums.rows.forEach((row) => {
      const description = doc.heightOfString(row.description, {width: widths[1] - 6});
      const height = Math.max(20, description + 8);
      if (y + height > 770) { doc.addPage(); y = 45; drawHeader(); }
      doc.fillColor('#111111');
      let x = margin;
      const values = [String(row.position), row.description, row.specification, row.unit, row.quantity.toFixed(2), money(row.total)];
      values.forEach((value, index) => { doc.rect(x, y, widths[index], height).strokeColor('#cccccc').lineWidth(0.4).stroke(); doc.text(value, x + 3, y + 5, {width: widths[index] - 6, align: index >= 4 ? 'right' : index === 0 || index === 3 ? 'center' : 'left'}); x += widths[index]; });
      y += height;
    });
    const summary = output.piedāvājums.summary;
    y += 14;
    doc.font(boldFont).fontSize(9).text('KOPSAVILKUMS', margin, y); y += 15;
    const summaryRows = [['Materiāli', money(summary.materials)], ['Darbs un virsizdevumi', money(summary.labor)], ['Virsizdevumi', money(summary.overhead)], ['Atlaide', money(summary.discount)], ['Starpsumma', money(summary.subtotal)], ['PVN', money(summary.vat)], ['Gala summa', money(summary.total)]];
    summaryRows.forEach(([label, value]) => { doc.font(label === 'Gala summa' ? boldFont : regularFont).text(label, margin + 315, y, {width: 120}); doc.text(value, margin + 435, y, {width: 120, align: 'right'}); y += 14; });
    y += 15;
    doc.moveTo(margin, y).lineTo(pageWidth - margin, y).strokeColor('#e83c33').stroke(); y += 12;
    doc.font(boldFont).fontSize(10).text('10 GADU GARANTIJA JUMTA RENOVĀCIJAS UN BŪVĒŠANAS DARBIEM', margin, y);
    doc.font(regularFont).fontSize(9).text('50 GADU GARANTIJA MATERIĀLIEM', margin, y + 15);
    doc.font(boldFont).fontSize(10).text('IZMANTOJAM BŪVNIECĪBAS METODI - M-I-E-R-S', margin, y + 48);
    doc.font(regularFont).fontSize(8).text('M - materiālu ilgmūžība\nI - izpildījuma kvalitāte ar sertificētiem speciālistiem\nE - estētiski pievilcīgi risinājumi\nR - rezultāta garantija un pilna atbildības uzņemšanās\nS - serviss un attieksme visos būvniecības posmos', margin, y + 66, {lineGap: 2});
    doc.font(regularFont).fontSize(8).fillColor('#555555').text('Izmaksās ir iekļauti visi nepieciešamie materiāli, palīglīdzekļi un darbs pilnvērtīgu jumta renovācijas darbu veikšanai.', margin, 785, {width: tableWidth});
  } else {
    doc.font(boldFont).fontSize(17).fillColor('#222222').text('Lokālā tāme Nr.1', margin, 82);
    doc.font(regularFont).fontSize(9).text(`Jumta renovācija | Klients: ${customer} | Objekts: ${address}`, margin, 108);
    doc.text(`Tāme sastādīta ${new Date().toLocaleDateString('lv-LV')}`, pageWidth - margin - 180, 108, {width: 180, align: 'right'});
    let y = 135;
    const widths = [28, 168, 34, 42, 42, 48, 48, 48, 42, 44, 42, 48, 48, 48, 56];
    const topHeaders = ['Nr.p.k.', 'Darba nosaukums', 'Mērv.', 'Daudz.', 'Vienības izmaksas', '', '', '', '', '', 'Kopā uz visu apjomu', '', '', '', ''];
    const headers = ['Nr.', 'Darba nosaukums', 'Mērv.', 'Daudz.', 'Laika norma', 'Likme EUR/h', 'Darba alga', 'Materiāli', 'Mehānismi', 'Kopā', 'Laika norma', 'Darba alga', 'Materiāli', 'Mehānismi', 'Kopā'];
    doc.rect(margin, y, tableWidth, 26).fill('#eeeeee'); doc.font(boldFont).fontSize(6); let x = margin;
    topHeaders.forEach((header, index) => { if (header) doc.fillColor('#222222').text(header, x + 1, y + 8, {width: widths[index] - 2, align: 'center'}); x += widths[index]; });
    y += 26; x = margin;
    headers.forEach((header, index) => { doc.rect(x, y, widths[index], 32).fill('#f4f4f4').strokeColor('#000000').lineWidth(0.4).stroke(); doc.fillColor('#222222').text(header, x + 1, y + 8, {width: widths[index] - 2, align: index < 2 ? 'left' : 'center'}); x += widths[index]; }); y += 32;
    output.f2Forma.rows.forEach((row) => { if (y > 770) { doc.addPage({size: 'A4', layout: 'landscape', margin}); y = 45; } const values = [String(row.row), row.description, row.unit, row.quantity.toFixed(2), String(row.laborHours ?? ''), money(18), money(row.totalLabor), money(row.totalMaterial), money(row.mechanisms), money(row.totalLabor + row.totalMaterial + (row.mechanisms || 0)), String(row.laborHours ?? ''), money(row.totalLabor), money(row.totalMaterial), money(row.mechanisms), money(row.total)]; const height = Math.max(16, doc.heightOfString(row.description, {width: widths[1] - 4}) + 5); x = margin; doc.font(regularFont).fontSize(5.5); values.forEach((value, index) => { doc.rect(x, y, widths[index], height).strokeColor('#999999').lineWidth(0.25).stroke(); doc.fillColor('#111111').text(value, x + 1, y + 4, {width: widths[index] - 2, align: index > 1 ? 'right' : 'left'}); x += widths[index]; }); y += height; });
    const summary = output.f2Forma.summary; y += 15; doc.font(boldFont).fontSize(9).text('KOPSAVILKUMS', margin, y); y += 15; [['Tiešās izmaksas kopā', summary.directCosts], ['Virsizdevumi', summary.overhead], ['Peļņa', summary.profit], ['Darba devēja soc. nodoklis', summary.employerTax], ['Pavisam kopā bez PVN', summary.subtotalExVat], ['PVN 21%', summary.vat], ['Kopā ar PVN', summary.totalIncVat]].forEach(([label, value]) => { doc.font(String(label) === 'Kopā ar PVN' ? boldFont : regularFont).text(String(label), pageWidth - margin - 210, y, {width: 120}); doc.text(money(value), pageWidth - margin - 85, y, {width: 85, align: 'right'}); y += 14; });
    doc.font(regularFont).fontSize(8).text('Izmaksu tāmi sastādīja un apstiprina SIA UpLift valdes priekšsēdētājs, Kārlis Niķis', margin, 780);
    doc.text('SIA UpLift būvkomersanta reģistrācijas numurs Nr.18223', pageWidth - margin - 280, 780, {width: 280, align: 'right'});
  }
}

export function createWorkbookPdfBuffer(output: EstimatorOutput, kind: 'offer' | 'f2', customer: string, address: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({size: 'A4', layout: kind === 'f2' ? 'landscape' : 'portrait', margin: 38, autoFirstPage: true});
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    doc.registerFont('Arial', regularFont).registerFont('Arial-Bold', boldFont);
    renderDocument(doc, output, kind, customer, address);
    doc.end();
  });
}
