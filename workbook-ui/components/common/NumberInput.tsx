import { formatNum } from '@/workbook-ui/lib/format';

interface Props {
  value: number | null | undefined;
  onChange?: (value: number | null) => void;
  readOnly?: boolean;
  /** Original value when this field overrides a shared setting. */
  baseValue?: number | null;
  label: string;
}

export function NumberInput({ value, onChange, readOnly, baseValue, label }: Props) {
  const overridden = baseValue !== undefined;
  return (
    <span className="number-input">
      <input
        type="number"
        step="any"
        aria-label={label}
        className={overridden ? 'is-overridden' : undefined}
        readOnly={readOnly}
        tabIndex={readOnly ? -1 : undefined}
        value={value === null || value === undefined ? '' : readOnly ? +Number(value).toFixed(3) : value}
        onChange={(e) => onChange?.(e.target.value === '' ? null : Number(e.target.value))}
      />
      {overridden && <small className="was">was {formatNum(baseValue)}</small>}
    </span>
  );
}
