import type { ReactNode } from 'react';

interface Props { title?: string; titleLv?: string; aside?: ReactNode; id?: string; children: ReactNode; flush?: boolean }

export function Panel({ title, titleLv, aside, id, children, flush }: Props) {
  return (
    <section className="panel" id={id}>
      {title && (
        <header className="panel-header">
          <h3>{title} {titleLv && <span className="lv">{titleLv}</span>}</h3>
          {aside}
        </header>
      )}
      <div className={flush ? 'panel-body flush' : 'panel-body'}>{children}</div>
    </section>
  );
}
