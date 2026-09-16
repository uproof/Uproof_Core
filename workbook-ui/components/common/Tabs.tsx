export interface TabItem<T extends string> { id: T; label: string; count?: number }

interface Props<T extends string> { items: TabItem<T>[]; active: T; onChange: (id: T) => void; label: string }

export function Tabs<T extends string>({ items, active, onChange, label }: Props<T>) {
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {items.map((t) => (
        <button key={t.id} type="button" role="tab" aria-selected={t.id === active} onClick={() => onChange(t.id)}>
          {t.label}{t.count !== undefined && <span className="count">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}
