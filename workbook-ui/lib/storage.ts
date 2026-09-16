/** Local draft storage. Wrapped because storage can be unavailable (private mode, sandboxed frames). */
const PREFIX = 'estimator:';
export const storage = {
  get<T>(key: string): T | null {
    try { const raw = localStorage.getItem(PREFIX + key); return raw ? (JSON.parse(raw) as T) : null; } catch { return null; }
  },
  set(key: string, value: unknown): void {
    try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch { /* ignore */ }
  },
  remove(key: string): void {
    try { localStorage.removeItem(PREFIX + key); } catch { /* ignore */ }
  },
};
