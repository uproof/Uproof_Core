import { createHttpApi } from './httpClient';
import type { EstimatorApi } from './types';

export * from './types';

/** The workbook UI is served inside CRM and uses the authenticated Next API. */
export const api: EstimatorApi = createHttpApi('/api/estimator/workbook');
