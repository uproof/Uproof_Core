'use client';

type Props = {
  title: string;
  columns?: string[];
  cards?: string[];
};

export function EmptyOutputState({title, columns = ['Description', 'Quantity', 'Unit', 'Total'], cards = []}: Props) {
  return <section className="output-empty" aria-label={`${title} preview`}>
    <div className="output-empty-header"><div><h3>{title}</h3><p>Add the required Inputs data to calculate these results.</p></div><span>Preview</span></div>
    {cards.length > 0 ? <div className="output-empty-cards">{cards.map((card) => <div key={card} className="output-empty-card"><span>{card}</span><strong>—</strong></div>)}</div> : null}
    <div className="output-empty-table"><div className="output-empty-row output-empty-heading">{columns.map((column) => <span key={column}>{column}</span>)}</div>{[1, 2, 3].map((row) => <div className="output-empty-row" key={row}>{columns.map((column) => <span key={column} className="output-empty-cell">—</span>)}</div>)}</div>
  </section>;
}
