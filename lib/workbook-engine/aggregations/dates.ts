/** Calendar dates without time zones (UTC midnight). */
export const parseIsoDate = (iso: string): Date => {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};
export const toIsoDate = (d: Date): string => d.toISOString().slice(0, 10);
export const addDays = (d: Date, days: number): Date => new Date(d.getTime() + days * 86_400_000);
export const todayIso = (): string => new Date().toISOString().slice(0, 10);
