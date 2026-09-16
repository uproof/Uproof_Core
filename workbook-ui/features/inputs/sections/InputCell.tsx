import { NumberInput } from '@/workbook-ui/components/common';
import { useInputField } from '../useInputField';

/** Bare numeric input for table layouts. */
export function InputCell({ inputKey, label }: { inputKey: string; label?: string }) {
  const f = useInputField(inputKey);
  return <NumberInput label={label ?? f.def?.l ?? inputKey} value={f.value} readOnly={f.derived} onChange={f.set} />;
}
