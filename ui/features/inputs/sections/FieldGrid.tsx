'use client';

import { NumberInput } from '@/ui/components/common';
import type { InputDef } from '@/ui/api';
import { HIDDEN_INPUTS, UNUSED_INPUTS, unitLabel } from '../sectionsConfig';
import { useInputField } from '../useInputField';

export function FieldGrid({ defs }: { defs: InputDef[] }) {
  return <div className="field-grid">{defs.filter((d) => d.u !== 'text' && !HIDDEN_INPUTS.has(d.k)).map((d) => <InputField key={d.k} def={d} />)}</div>;
}

function InputField({ def }: { def: InputDef }) {
  const f = useInputField(def.k);
  const label = (def.l ?? def.k).replace(/\n/g, ' ').replace(/,\s*(m2|m3|m|gb|km|mēn|dienas)\s*$/, '');
  const unused = UNUSED_INPUTS.has(def.k);
  return (
    <label className={unused ? 'field is-unused' : 'field'} title={def.k}>
      <span>
        {label}
        {unused && <em className="tag">not used yet</em>}
        {def.d && <em className="tag">calculated</em>}
        <small>{unitLabel(def.u)}</small>
      </span>
      <NumberInput label={label} value={f.value} readOnly={f.derived} onChange={f.set} />
    </label>
  );
}
