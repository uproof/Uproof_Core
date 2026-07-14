export type CrmEstimatorFieldType = 'select' | 'boolean' | 'number' | 'text' | 'textarea' | 'derived';

export type CrmEstimatorSelectOption = {
  label: string;
  value: string;
};

export type CrmEstimatorLegacyRow = {
  label: string;
  measurement: string;
  notes: string;
};

export type CrmEstimatorFormData = {
  roofProblem: string;
  existingRoofCovering: string;
  existingRoofArea: string;
  buildingType: string;
  desiredRoofCovering: string;
  hasAtticFloor: boolean | null;
  hasRoofWindows: boolean | null;
  roofWindowCount: number | null;
  roofWindowSizeModel: string;
  materialType: string;
  desiredMaterialColor: string;
  lathingArea: string;
  roofPitch: string;
  chimneyCount: number | null;
  roofLukeCount: number | null;
  ventilationOutletCount: number | null;
  gutterSystem: string;
  eaveBoxRenovation: boolean | null;
  eaveBoxFrame: boolean | null;
  insulation: string;
  insulationThickness: string;
  atticWalkwayConstruction: boolean | null;
  walkwayPointsFromTo: string;
  roofStructureCondition: string;
  woodFacadeFinish: boolean | null;
  chimneyRenovation: string;
  chimneyRenovationCount: number | null;
  chimneySheetCladding: boolean | null;
  chimneySheetCladdingCount: number | null;
  chimneyCaps: boolean | null;
  chimneyCapsCount: number | null;
  snowBarriers: string;
  snowBarrierZones: string;
  roofWalkways: boolean | null;
  roofWalkwaysPointsFromTo: string;
  roofLadders: boolean | null;
  roofLaddersPointsFromTo: string;
  wallLadders: boolean | null;
  wallLaddersPointsFromTo: string;
  safetyRopeSystems: boolean | null;
  safetyRopePointsFromTo: string;
  snowAndIceMeltingSystems: boolean | null;
  meltingSystemZones: string;
  atticHatchFromStairwell: boolean | null;
  atticHatchCount: number | null;
  ventilatedRoof: boolean;
  comment1: string;
  comment2: string;
  comment3: string;
  plannedExecutionTime: string;
  legacyRows: CrmEstimatorLegacyRow[];
};

export type CrmEstimatorFieldDefinition = {
  key: keyof CrmEstimatorFormData;
  label: string;
  type: CrmEstimatorFieldType;
  section: string;
  options?: CrmEstimatorSelectOption[];
  placeholder?: string;
  helper?: string;
};

export const CRM_ESTIMATOR_BOOLEAN_OPTIONS: CrmEstimatorSelectOption[] = [
  {label: 'Jā', value: 'true'},
  {label: 'Nē', value: 'false'},
];

export const CRM_ESTIMATOR_FIELD_DEFINITIONS: CrmEstimatorFieldDefinition[] = [
  {section: 'Roof basics', key: 'roofProblem', label: 'Esošā problēma ar jumtu', type: 'select', options: [
    {label: 'Jumts tek vairākās vietās', value: 'Jumts tek vairākās vietās'},
    {label: 'Jumts tek vienā vietā', value: 'Jumts tek vienā vietā'},
    {label: 'Jumts nolietojies', value: 'Jumts nolietojies'},
    {label: 'vecs', value: 'vecs'},
  ]},
  {section: 'Roof basics', key: 'existingRoofCovering', label: 'Esošais jumta segums', type: 'select', options: [
    {label: 'Šīferis', value: 'Šīferis'},
    {label: 'Bitumena šindelis', value: 'Bitumena šindelis'},
    {label: 'Valcprofils', value: 'Valcprofils'},
    {label: 'Skrūvējams jumta segums', value: 'Skrūvējams jumta segums'},
    {label: 'Betona/māla dakstiņi', value: 'Betona/māla dakstiņi'},
    {label: 'Lubiņi', value: 'Lubiņi'},
    {label: 'Cits / vairāki', value: 'Cits / vairāki'},
  ]},
  {section: 'Roof basics', key: 'existingRoofArea', label: 'Aptuvenā platība, ja ir zināms', type: 'text', placeholder: '180 m2'},
  {section: 'Roof basics', key: 'buildingType', label: 'Ēkas tips', type: 'select', options: [
    {label: 'Privātmāja', value: 'Privātmāja'},
    {label: 'Dzīvokļu ēka', value: 'Dzīvokļu ēka'},
    {label: 'Cits', value: 'Cits'},
    {label: 'Industriālā ēka', value: 'Industriālā ēka'},
  ]},
  {section: 'Roof basics', key: 'desiredRoofCovering', label: 'Vēlamais jumta segums', type: 'select', options: [
    {label: 'Metāla- Valcprofila', value: 'Metāla- Valcprofila'},
    {label: 'Bezasbesta šīferis', value: 'Bezasbesta šīferis'},
    {label: 'Betona dakstiņi', value: 'Betona dakstiņi'},
    {label: 'Māla dakstiņi', value: 'Māla dakstiņi'},
    {label: 'Bitumena šindelis', value: 'Bitumena šindelis'},
    {label: 'Metāla skrūvējams', value: 'Metāla skrūvējams'},
  ]},
  {section: 'Roof basics', key: 'hasAtticFloor', label: 'Vai ir mansarda stāvs', type: 'boolean'},
  {section: 'Roof basics', key: 'hasRoofWindows', label: 'Vai ir jumta logi', type: 'boolean'},
  {section: 'Roof basics', key: 'roofWindowCount', label: 'Jumta logu skaits', type: 'number', helper: 'Aizpilda, ja ir jumta logi'},
  {section: 'Roof basics', key: 'roofWindowSizeModel', label: 'Jumta logu izmērs/modelis', type: 'text', helper: 'Aizpilda, ja ir jumta logi', placeholder: 'Velux GGL'},
  {section: 'Materials', key: 'materialType', label: 'Materiāla tips', type: 'select', options: [
    {label: 'Valcprofils Rukki', value: 'Valcprofils Rukki'},
    {label: 'Valcprofils cinkots', value: 'Valcprofils cinkots'},
    {label: 'Cits- ieraksti kāds', value: 'Cits- ieraksti kāds'},
    {label: 'ja ir specifisks', value: 'ja ir specifisks'},
  ]},
  {section: 'Materials', key: 'desiredMaterialColor', label: 'Vēlamā materiāla krāsa', type: 'text', placeholder: 'Krāsa'},
  {section: 'Materials', key: 'lathingArea', label: 'Latojuma platība', type: 'derived', helper: 'Same as existing roof area'},
  {section: 'Materials', key: 'roofPitch', label: 'Jumta slīpums aptuveni', type: 'select', options: [
    {label: '>15 grādi', value: '>15 grādi'},
    {label: '15-25 grādi', value: '15-25 grādi'},
    {label: '25-35 grādi', value: '25-35 grādi'},
    {label: '35-45 grādi', value: '35-45 grādi'},
    {label: '<45 grādi', value: '<45 grādi'},
  ]},
  {section: 'Counts', key: 'chimneyCount', label: 'Skursteņu skaits', type: 'number', placeholder: 'Skaits'},
  {section: 'Counts', key: 'roofLukeCount', label: 'Jumta lūkas skaits', type: 'number', placeholder: 'Skaits'},
  {section: 'Counts', key: 'ventilationOutletCount', label: 'Ventilācijas izvadu skaits', type: 'number', placeholder: 'Skaits'},
  {section: 'Water management', key: 'gutterSystem', label: 'Noteksistēma', type: 'select', options: [
    {label: 'Visam jumtam', value: 'Visam jumtam'},
    {label: 'Daļai jumta- jānorāda kurai daļai', value: 'Daļai jumta- jānorāda kurai daļai'},
    {label: 'Nav nepieciešams', value: 'Nav nepieciešams'},
    {label: 'Iebūvēta noteksistēma visam jumtam', value: 'Iebūvēta noteksistēma visam jumtam'},
    {label: 'Grib saglabāt esošo', value: 'Grib saglabāt esošo'},
  ]},
  {section: 'Water management', key: 'eaveBoxRenovation', label: 'Vēja kastes atjaunošana', type: 'boolean'},
  {section: 'Water management', key: 'eaveBoxFrame', label: 'Vēja kastes karkas', type: 'boolean'},
  {section: 'Insulation', key: 'insulation', label: 'Siltināšana', type: 'select', options: [
    {label: 'Visa mansarda platība', value: 'Visa mansarda platība'},
    {label: 'Visa bēniņu platība beramvate', value: 'Visa bēniņu platība beramvate'},
    {label: 'Nav nepieciešams', value: 'Nav nepieciešams'},
  ]},
  {section: 'Insulation', key: 'insulationThickness', label: 'Siltinājuma biezums, ja bēniņos nepieciešams', type: 'text', placeholder: '200 mm'},
  {section: 'Insulation', key: 'atticWalkwayConstruction', label: 'Bēniņu laipas izbūve', type: 'boolean'},
  {section: 'Insulation', key: 'walkwayPointsFromTo', label: 'Bēniņu laipas punkti no - līdz', type: 'text', helper: 'punkti no - līdz'},
  {section: 'Structure', key: 'roofStructureCondition', label: 'Jumta konstrukciju stāvoklis', type: 'select', options: [
    {label: 'Nav zināms', value: 'Nav zināms'},
    {label: 'jāapskata dzīvē', value: 'jāapskata dzīvē'},
    {label: 'Viss jāmaina', value: 'Viss jāmaina'},
    {label: 'Iespējams daļēji jalabo', value: 'Iespējams daļēji jalabo'},
    {label: 'Jāizbūvē papildus jauna', value: 'Jāizbūvē papildus jauna'},
  ]},
  {section: 'Structure', key: 'woodFacadeFinish', label: 'Koka fasādes izbūve, apdare', type: 'boolean'},
  {section: 'Structure', key: 'chimneyRenovation', label: 'Skursteņu atjaunošana', type: 'select', options: [
    {label: 'Daļēji jāpārmūrē', value: 'Daļēji jāpārmūrē'},
    {label: 'Pilnībā jāpārmūrē', value: 'Pilnībā jāpārmūrē'},
    {label: 'Jāatjauno apmetums', value: 'Jāatjauno apmetums'},
    {label: 'Jāpārkrāso', value: 'Jāpārkrāso'},
    {label: 'Nav zināms', value: 'Nav zināms'},
    {label: 'jāskatās dzīvē', value: 'jāskatās dzīvē'},
    {label: 'Nav nepieciešams', value: 'Nav nepieciešams'},
  ]},
  {section: 'Structure', key: 'chimneyRenovationCount', label: 'Skursteņu atjaunošana - skaits', type: 'number', placeholder: 'Skaits'},
  {section: 'Structure', key: 'chimneySheetCladding', label: 'Skursteņu apdare ar skārdu', type: 'boolean'},
  {section: 'Structure', key: 'chimneySheetCladdingCount', label: 'Skursteņu apdare ar skārdu - skaits', type: 'number', placeholder: 'Skaits'},
  {section: 'Structure', key: 'chimneyCaps', label: 'Skursteņu jumtiņi/cepures', type: 'boolean'},
  {section: 'Structure', key: 'chimneyCapsCount', label: 'Skursteņu jumtiņi/cepures - skaits', type: 'number', placeholder: 'Skaits'},
  {section: 'Safety', key: 'snowBarriers', label: 'Sniega barjeras', type: 'select', options: [
    {label: 'Jā', value: 'Jā'},
    {label: 'visam jumtam', value: 'visam jumtam'},
    {label: 'Nav nepieciešams', value: 'Nav nepieciešams'},
    {label: 'Daļēji- jānorāda zonas', value: 'Daļēji- jānorāda zonas'},
  ]},
  {section: 'Safety', key: 'snowBarrierZones', label: 'Sniega barjeru zonas', type: 'text', helper: 'Zonas'},
  {section: 'Safety', key: 'roofWalkways', label: 'Jumta pārvietošanās laipas', type: 'boolean'},
  {section: 'Safety', key: 'roofWalkwaysPointsFromTo', label: 'Jumta pārvietošanās laipas - punkti no - līdz', type: 'text', helper: 'punkti no - līdz'},
  {section: 'Safety', key: 'roofLadders', label: 'Jumta kāpnes', type: 'boolean'},
  {section: 'Safety', key: 'roofLaddersPointsFromTo', label: 'Jumta kāpnes - punkti no - līdz', type: 'text', helper: 'punkti no - līdz'},
  {section: 'Safety', key: 'wallLadders', label: 'Sienas kāpnes', type: 'boolean'},
  {section: 'Safety', key: 'wallLaddersPointsFromTo', label: 'Sienas kāpnes - punkti no - līdz', type: 'text', helper: 'punkti no - līdz'},
  {section: 'Safety', key: 'safetyRopeSystems', label: 'Drošības troses sistēmas', type: 'boolean'},
  {section: 'Safety', key: 'safetyRopePointsFromTo', label: 'Drošības troses sistēmas - punkti no - līdz', type: 'text', helper: 'punkti no - līdz'},
  {section: 'Safety', key: 'snowAndIceMeltingSystems', label: 'Sniega un ledus kausēšanas sistēmas', type: 'boolean'},
  {section: 'Safety', key: 'meltingSystemZones', label: 'Sniega un ledus kausēšanas sistēmas zonas', type: 'text', helper: 'Zonas'},
  {section: 'Access', key: 'atticHatchFromStairwell', label: 'Bēniņu lūka no kāpņutelpas', type: 'boolean'},
  {section: 'Access', key: 'atticHatchCount', label: 'Bēniņu lūka no kāpņutelpas - skaits', type: 'number', placeholder: 'Skaits'},
  {section: 'Access', key: 'ventilatedRoof', label: 'Ventilējams jumts', type: 'boolean'},
  {section: 'Comments', key: 'comment1', label: 'Citi komentāri', type: 'text', placeholder: 'Komentārs 1'},
  {section: 'Comments', key: 'comment2', label: 'Citis komentāri', type: 'text', placeholder: 'Komentārs 2'},
  {section: 'Comments', key: 'comment3', label: 'Cits', type: 'text', placeholder: 'Komentārs 3'},
  {section: 'Comments', key: 'plannedExecutionTime', label: 'Plānotais/vēlamais izpildes laiks', type: 'text', placeholder: 'Laika periods'},
];

export const CRM_ESTIMATOR_FIELD_SECTIONS = Array.from(new Set(CRM_ESTIMATOR_FIELD_DEFINITIONS.map((definition) => definition.section)));

export function createEmptyCrmEstimatorData(): CrmEstimatorFormData {
  return {
    roofProblem: '',
    existingRoofCovering: '',
    existingRoofArea: '',
    buildingType: '',
    desiredRoofCovering: '',
    hasAtticFloor: null,
    hasRoofWindows: null,
    roofWindowCount: null,
    roofWindowSizeModel: '',
    materialType: '',
    desiredMaterialColor: '',
    lathingArea: '',
    roofPitch: '',
    chimneyCount: null,
    roofLukeCount: null,
    ventilationOutletCount: null,
    gutterSystem: '',
    eaveBoxRenovation: null,
    eaveBoxFrame: null,
    insulation: '',
    insulationThickness: '',
    atticWalkwayConstruction: null,
    walkwayPointsFromTo: '',
    roofStructureCondition: '',
    woodFacadeFinish: null,
    chimneyRenovation: '',
    chimneyRenovationCount: null,
    chimneySheetCladding: null,
    chimneySheetCladdingCount: null,
    chimneyCaps: null,
    chimneyCapsCount: null,
    snowBarriers: '',
    snowBarrierZones: '',
    roofWalkways: null,
    roofWalkwaysPointsFromTo: '',
    roofLadders: null,
    roofLaddersPointsFromTo: '',
    wallLadders: null,
    wallLaddersPointsFromTo: '',
    safetyRopeSystems: null,
    safetyRopePointsFromTo: '',
    snowAndIceMeltingSystems: null,
    meltingSystemZones: '',
    atticHatchFromStairwell: null,
    atticHatchCount: null,
    ventilatedRoof: true,
    comment1: '',
    comment2: '',
    comment3: '',
    plannedExecutionTime: '',
    legacyRows: [],
  };
}

function normalizeBoolean(value: unknown): boolean | null {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'jā' || normalized === 'yes' || normalized === 'true') return true;
    if (normalized === 'nē' || normalized === 'no' || normalized === 'false') return false;
  }
  return null;
}

function normalizeNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const normalized = value.trim();
    if (!normalized) return null;
    const parsed = Number(normalized.replace(',', '.').replace(/[^\d.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeLegacyRows(value: unknown): CrmEstimatorLegacyRow[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => {
      if (!row || typeof row !== 'object') return null;
      const candidate = row as Partial<CrmEstimatorLegacyRow>;
      return {
        label: normalizeText(candidate.label),
        measurement: normalizeText(candidate.measurement),
        notes: normalizeText(candidate.notes),
      };
    })
    .filter((row): row is CrmEstimatorLegacyRow => Boolean(row && (row.label || row.measurement || row.notes)));
}

export function formatEstimatorValue(value: unknown): string {
  if (typeof value === 'boolean') return value ? 'Jā' : 'Nē';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : '';
  return typeof value === 'string' ? value.trim() : '';
}

export function normalizeCrmEstimatorData(value: unknown, fallback: CrmEstimatorFormData = createEmptyCrmEstimatorData()): CrmEstimatorFormData {
  if (!value || typeof value !== 'object') {
    return fallback;
  }

  if (Array.isArray(value)) {
    return {
      ...createEmptyCrmEstimatorData(),
      legacyRows: normalizeLegacyRows(value),
    };
  }

  const candidate = value as Partial<Record<keyof CrmEstimatorFormData, unknown>>;
  const existingRoofArea = normalizeText(candidate.existingRoofArea);

  return {
    roofProblem: normalizeText(candidate.roofProblem),
    existingRoofCovering: normalizeText(candidate.existingRoofCovering),
    existingRoofArea,
    buildingType: normalizeText(candidate.buildingType),
    desiredRoofCovering: normalizeText(candidate.desiredRoofCovering),
    hasAtticFloor: normalizeBoolean(candidate.hasAtticFloor),
    hasRoofWindows: normalizeBoolean(candidate.hasRoofWindows),
    roofWindowCount: normalizeNumber(candidate.roofWindowCount),
    roofWindowSizeModel: normalizeText(candidate.roofWindowSizeModel),
    materialType: normalizeText(candidate.materialType),
    desiredMaterialColor: normalizeText(candidate.desiredMaterialColor),
    lathingArea: normalizeText(candidate.lathingArea) || existingRoofArea,
    roofPitch: normalizeText(candidate.roofPitch),
    chimneyCount: normalizeNumber(candidate.chimneyCount),
    roofLukeCount: normalizeNumber(candidate.roofLukeCount),
    ventilationOutletCount: normalizeNumber(candidate.ventilationOutletCount),
    gutterSystem: normalizeText(candidate.gutterSystem),
    eaveBoxRenovation: normalizeBoolean(candidate.eaveBoxRenovation),
    eaveBoxFrame: normalizeBoolean(candidate.eaveBoxFrame),
    insulation: normalizeText(candidate.insulation),
    insulationThickness: normalizeText(candidate.insulationThickness),
    atticWalkwayConstruction: normalizeBoolean(candidate.atticWalkwayConstruction),
    walkwayPointsFromTo: normalizeText(candidate.walkwayPointsFromTo),
    roofStructureCondition: normalizeText(candidate.roofStructureCondition),
    woodFacadeFinish: normalizeBoolean(candidate.woodFacadeFinish),
    chimneyRenovation: normalizeText(candidate.chimneyRenovation),
    chimneyRenovationCount: normalizeNumber(candidate.chimneyRenovationCount),
    chimneySheetCladding: normalizeBoolean(candidate.chimneySheetCladding),
    chimneySheetCladdingCount: normalizeNumber(candidate.chimneySheetCladdingCount),
    chimneyCaps: normalizeBoolean(candidate.chimneyCaps),
    chimneyCapsCount: normalizeNumber(candidate.chimneyCapsCount),
    snowBarriers: normalizeText(candidate.snowBarriers),
    snowBarrierZones: normalizeText(candidate.snowBarrierZones),
    roofWalkways: normalizeBoolean(candidate.roofWalkways),
    roofWalkwaysPointsFromTo: normalizeText(candidate.roofWalkwaysPointsFromTo),
    roofLadders: normalizeBoolean(candidate.roofLadders),
    roofLaddersPointsFromTo: normalizeText(candidate.roofLaddersPointsFromTo),
    wallLadders: normalizeBoolean(candidate.wallLadders),
    wallLaddersPointsFromTo: normalizeText(candidate.wallLaddersPointsFromTo),
    safetyRopeSystems: normalizeBoolean(candidate.safetyRopeSystems),
    safetyRopePointsFromTo: normalizeText(candidate.safetyRopePointsFromTo),
    snowAndIceMeltingSystems: normalizeBoolean(candidate.snowAndIceMeltingSystems),
    meltingSystemZones: normalizeText(candidate.meltingSystemZones),
    atticHatchFromStairwell: normalizeBoolean(candidate.atticHatchFromStairwell),
    atticHatchCount: normalizeNumber(candidate.atticHatchCount),
    ventilatedRoof: typeof candidate.ventilatedRoof === 'boolean' ? candidate.ventilatedRoof : normalizeBoolean(candidate.ventilatedRoof) ?? true,
    comment1: normalizeText(candidate.comment1),
    comment2: normalizeText(candidate.comment2),
    comment3: normalizeText(candidate.comment3),
    plannedExecutionTime: normalizeText(candidate.plannedExecutionTime),
    legacyRows: normalizeLegacyRows(candidate.legacyRows),
  };
}

export function stringifyEstimatorData(data: CrmEstimatorFormData): string {
  return JSON.stringify(data);
}

export function summarizeEstimatorData(data: CrmEstimatorFormData): Array<{label: string; value: string}> {
  const summaryFields: Array<keyof CrmEstimatorFormData> = [
    'roofProblem',
    'existingRoofCovering',
    'buildingType',
    'desiredRoofCovering',
    'roofPitch',
    'gutterSystem',
    'insulation',
    'roofStructureCondition',
    'plannedExecutionTime',
  ];

  return summaryFields
    .map((key) => ({
      label: CRM_ESTIMATOR_FIELD_DEFINITIONS.find((definition) => definition.key === key)?.label || String(key),
      value: formatEstimatorValue(data[key]),
    }))
    .filter((entry) => entry.value);
}