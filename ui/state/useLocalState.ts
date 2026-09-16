'use client';

import { useState } from 'react';
/** Volatile UI state only. Estimator data is persisted through the CRM API. */
export function useLocalState<T>(key: string, initial: T): [T, (v: T | ((p: T) => T)) => void] {
  void key;
  return useState<T>(initial);
}
