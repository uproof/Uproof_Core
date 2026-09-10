/**
 * UpRoof branded PDF renderer for estimator outputs
 * Generates Piedāvājums (customer offer) and F2 forma (detailed estimate) PDFs
 */

import type { EstimatorOutput } from './estimatorEngine';

/**
 * Generate a simple branded PDF buffer for the estimator output
 * This extends lib/simplePdf.ts to handle complex table layouts
 */
export function generateEstimatorPdfBuffer(output: EstimatorOutput, kind: 'piedāvājums' | 'f2' = 'piedāvājums'): Buffer {
  // For now, return a simple PDF structure
  // In production, integrate with a PDF library like pdfkit or reportlab-js
  const lines: string[] = [];

  const branding = {
    company: 'SIA UpLift',
    website: 'UpRoof.EU',
    registration: 'SIA UpLift, LV40203325641, Ēnas iela 7, Rīga, LV-1029, Latvija',
    phone: '+371 2xxxx xxx',
    warranty: '10 YEAR GUARANTEE ON WORKMANSHIP\n50 YEAR GUARANTEE ON MATERIALS',
  };

  if (kind === 'piedāvājums') {
    // Piedāvājums header
    lines.push('═'.repeat(80));
    lines.push(`MATERIĀLU UN IZMAKSU SARAKSTS - JUMTA RENOVĀCIJA`);
    lines.push(`${output.piedāvājums.title}`);
    lines.push('═'.repeat(80));
    lines.push('');

    // Table header
    lines.push(`${'Apraksts'.padEnd(50)} ${'Mērvienība'.padEnd(10)} ${'Daudzums'.padEnd(10)} ${'Kopā €'.padEnd(10)}`);

    lines.push('─'.repeat(80));

    // Table rows
    for (const row of output.piedāvājums.rows) {
      const desc = row.description.substring(0, 50).padEnd(50);
      const unit = row.unit.substring(0, 10).padEnd(10);
      const qty = row.quantity.toFixed(2).padStart(10);
      const total = `€ ${row.total.toFixed(2)}`.padStart(9);
      lines.push(`${desc} ${unit} ${qty} ${total}`);
    }

    lines.push('─'.repeat(80));

    // Summary
    lines.push('');
    lines.push('SUMMARY:'.padEnd(50) + `Total €${output.piedāvājums.summary.total.toFixed(2)}`.padStart(30));
    lines.push(
      'Materials:'.padEnd(50) + `€${output.piedāvājums.summary.materials.toFixed(2)}`.padStart(29),
    );
    lines.push('Labor & overhead:'.padEnd(50) + `€${output.piedāvājums.summary.labor.toFixed(2)}`.padStart(23));
    if (output.piedāvājums.summary.vat > 0) {
      lines.push('VAT (21%):'.padEnd(50) + `€${output.piedāvājums.summary.vat.toFixed(2)}`.padStart(25));
    }

    lines.push('');
    lines.push('═'.repeat(80));
    lines.push(`${branding.warranty}`);
    lines.push('');
    lines.push(`${branding.company} | ${branding.website}`);
    lines.push(`${branding.registration}`);
  } else {
    // F2 Forma header
    lines.push('═'.repeat(100));
    lines.push(`${output.f2Forma.title}`);
    lines.push(`LOKĀLĀ TĀME Nr.1 - DETAILED ESTIMATE`);
    lines.push('═'.repeat(100));
    lines.push('');

    // Table header for F2
    lines.push(
      `${'#'.padEnd(4)} ${'Work Description'.padEnd(45)} ${'Unit'.padEnd(8)} ${'Qty'.padEnd(8)} ${'Unit €'.padEnd(10)} ${'Total €'.padEnd(12)}`,
    );
    lines.push('─'.repeat(100));

    // Table rows
    for (const row of output.f2Forma.rows) {
      const num = `${row.row}`.padEnd(4);
      const desc = row.description.substring(0, 45).padEnd(45);
      const unit = row.unit.padEnd(8);
      const qty = row.quantity.toFixed(2).padStart(8);
      const price = `€${row.unitPrice.toFixed(2)}`.padStart(9);
      const total = `€${row.total.toFixed(2)}`.padStart(11);
      lines.push(`${num}${desc} ${unit}${qty} ${price} ${total}`);
    }

    lines.push('─'.repeat(100));

    // F2 Summary
    lines.push('');
    lines.push('DETAILED COSTS:'.padEnd(60) + 'Amount €'.padStart(40));
    lines.push('─'.repeat(100));
    lines.push(
      'Direct costs (materials & labor):'.padEnd(60) +
        `€${output.f2Forma.summary.directCosts.toFixed(2)}`.padStart(39),
    );
    lines.push(
      'Overhead (4%):'.padEnd(60) + `€${output.f2Forma.summary.overhead.toFixed(2)}`.padStart(39),
    );
    lines.push(
      'Profit margin (2%):'.padEnd(60) + `€${output.f2Forma.summary.profit.toFixed(2)}`.padStart(39),
    );
    lines.push(
      'Employer social tax (23.59%):'.padEnd(60) +
        `€${output.f2Forma.summary.employerTax.toFixed(2)}`.padStart(39),
    );
    lines.push('─'.repeat(100));
    lines.push(
      'Total before VAT:'.padEnd(60) +
        `€${output.f2Forma.summary.subtotalExVat.toFixed(2)}`.padStart(39),
    );
    lines.push(
      'VAT 21%:'.padEnd(60) + `€${output.f2Forma.summary.vat.toFixed(2)}`.padStart(39),
    );
    lines.push('═'.repeat(100));
    lines.push(
      'TOTAL WITH VAT:'.padEnd(60) +
        `€${output.f2Forma.summary.totalIncVat.toFixed(2)}`.padStart(39),
    );
    lines.push('═'.repeat(100));

    lines.push('');
    lines.push(`${branding.warranty}`);
    lines.push('');
    lines.push(`${branding.company} | ${branding.website}`);
    lines.push(`${branding.registration}`);
  }

  // Convert lines to text buffer
  const text = lines.join('\n');
  return Buffer.from(text, 'utf-8');
}

/**
 * Alternative: Generate PDF with proper formatting using a library
 * This is a stub for future integration with pdfkit or similar
 */
export function generateBrandedPdfWithLibrary(
  output: EstimatorOutput,
  kind: 'piedāvājums' | 'f2' = 'piedāvājums',
): Buffer {
  // TODO: Integrate pdfkit or similar library
  // For now, return the text version
  return generateEstimatorPdfBuffer(output, kind);
}
