"use client";

type SensitiveKind = 'phone' | 'email' | 'amount' | 'text';

type Props = {
  value: string;
  kind: SensitiveKind;
  className?: string;
};

function maskValue(value: string, kind: SensitiveKind) {
  if (!value) return '***';

  if (kind === 'text') {
    const trimmed = value.trim();
    if (trimmed.length <= 3) return '*'.repeat(Math.max(trimmed.length, 3));
    return `${trimmed.slice(0, 2)}${'*'.repeat(Math.max(trimmed.length - 4, 3))}${trimmed.slice(-2)}`;
  }

  if (kind === 'email') {
    const [name, domain] = value.split('@');
    if (!domain) return '***';
    const visible = name.slice(0, 2);
    return `${visible}${'*'.repeat(Math.max(name.length - 2, 2))}@${domain}`;
  }

  if (kind === 'amount') {
    return value.replace(/\d/g, '*');
  }

  const trimmed = value.trim();
  if (trimmed.length <= 4) return '*'.repeat(trimmed.length);
  return `${trimmed.slice(0, 2)}${'*'.repeat(Math.max(trimmed.length - 4, 3))}${trimmed.slice(-2)}`;
}

export default function SensitiveValue({value, kind, className}: Props) {
  const masked = maskValue(value, kind);

  return (
    <span className={className || 'inline-flex items-center rounded-lg border border-sky-200 px-2 py-1 text-left text-sm text-slate-700'} title={masked}>
      {masked}
    </span>
  );
}
