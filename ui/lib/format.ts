const money = new Intl.NumberFormat('lv-LV', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const plain = new Intl.NumberFormat('lv-LV', { maximumFractionDigits: 2 });

export const formatEur = (v: number | null | undefined) => `${money.format(v || 0)} €`;
export const format2 = (v: number | null | undefined) => money.format(v || 0);
export const formatNum = (v: number | null | undefined) => (v === null || v === undefined ? '' : plain.format(v));
export const formatPct = (share: number) => `${plain.format(share * 100)}%`;
export const formatDate = (d: Date, opts?: Intl.DateTimeFormatOptions) => d.toLocaleDateString('lv-LV', opts);
