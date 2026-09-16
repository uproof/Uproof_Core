import { createHttpApi } from './httpClient';
import type { EstimatorApi } from './types';

export * from './types';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/estimator/workbook';
export const api: EstimatorApi = createHttpApi(API_BASE_URL);
