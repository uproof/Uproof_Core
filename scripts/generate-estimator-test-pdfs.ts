import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {generateEstimatorOutput} from '../lib/estimatorEngine';
import {createWorkbookListPdfBuffer, createWorkbookPdfBuffer} from '../lib/workbookPdf';

const outputDirectory = path.join(process.cwd(), 'tmp', 'estimator-test-output');
const estimatorInput = {
  existingRoofArea: '168',
  roofPitch: '40',
  roofProblem: 'Jumts nolietojies',
  existingRoofCovering: 'Valcprofils',
  buildingType: 'Privātmāja',
  desiredRoofCovering: 'Metāla- Valcprofila',
  materialType: 'Valcprofils Rukki',
  gutterSystem: 'Visam jumtam',
  insulation: 'Visa mansarda platība',
  insulationThickness: '150',
  desiredMaterialColor: 'RR23',
  eaveBoxRenovation: true,
  snowBarriers: 'Jā',
  tameRows: [],
};

const output = generateEstimatorOutput(estimatorInput as never);
const mechanisms = output.f2Forma.rows
  .filter((row) => Number(row.mechanisms || 0) > 0)
  .map((row) => ({
    position: row.row,
    description: row.description,
    quantity: row.mechanisms,
    unit: 'EUR',
    total: row.mechanisms,
  }));
const documents: Array<[string, Promise<Buffer>]> = [
  ['piedavajums.pdf', createWorkbookPdfBuffer(output, 'offer', 'Sophie Martin', 'Pi********22')],
  ['f2-forma.pdf', createWorkbookPdfBuffer(output, 'f2', 'Sophie Martin', 'Pi********22')],
  ['materialu-saraksts.pdf', createWorkbookListPdfBuffer('Materiālu saraksts', output.materials)],
  ['darbu-plans.pdf', createWorkbookListPdfBuffer('Darbu plāns', output.workPlan)],
  ['dienas-plans.pdf', createWorkbookListPdfBuffer('Dienas plāns', output.dailyPlan || [])],
  ['mehanismu-saraksts.pdf', createWorkbookListPdfBuffer('Mehānismu saraksts', mechanisms)],
];

async function main() {
  await mkdir(outputDirectory, {recursive: true});
  for (const [filename, documentPromise] of documents) {
    const buffer = await documentPromise;
    if (buffer.subarray(0, 5).toString() !== '%PDF-') {
      throw new Error(`${filename} is not a PDF`);
    }
    await writeFile(path.join(outputDirectory, filename), buffer);
    console.log(`${filename}: ${buffer.length} bytes`);
  }

  console.log(`Saved to ${outputDirectory}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
