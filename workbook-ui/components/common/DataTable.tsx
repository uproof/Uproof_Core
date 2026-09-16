import type { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: ReactNode;
  align?: 'left' | 'right';
  width?: string;
  render: (row: T) => ReactNode;
}

interface Props<T> {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T, index: number) => string;
  footer?: ReactNode;
  empty?: ReactNode;
  maxHeight?: string;
}

/** Plain table with sticky header. Grouped tables (line items, F2) build their own rows. */
export function DataTable<T>({ rows, columns, rowKey, footer, empty, maxHeight }: Props<T>) {
  return (
    <div className="table-wrap" style={maxHeight ? { maxHeight } : undefined}>
      <table className="table">
        <thead>
          <tr>{columns.map((c) => <th key={c.key} className={c.align === 'right' ? 'num' : undefined} style={c.width ? { width: c.width } : undefined}>{c.header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length === 0 && empty && <tr><td colSpan={columns.length}>{empty}</td></tr>}
          {rows.map((r, i) => (
            <tr key={rowKey(r, i)}>
              {columns.map((c) => <td key={c.key} className={c.align === 'right' ? 'num' : undefined}>{c.render(r)}</td>)}
            </tr>
          ))}
        </tbody>
        {footer && <tfoot>{footer}</tfoot>}
      </table>
    </div>
  );
}
