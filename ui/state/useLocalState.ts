'use client';

import { useEffect, useState } from 'react';
import { storage } from '@/ui/lib/storage';

/** useState persisted to local storage (day tracking, tool checklist, UI toggles). */
export function useLocalState<T>(key: string, initial: T): [T, (v: T | ((p: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => storage.get<T>(key) ?? initial);
  useEffect(() => { storage.set(key, value); }, [key, value]);
  return [value, setValue];
}
