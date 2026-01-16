import { PropsWithChildren } from 'react'

export type GridProps = PropsWithChildren<{
  className?: string
  cols?: 1 | 2 | 3 | 4 | 5 | 6
  md?: 1 | 2 | 3 | 4 | 5 | 6 | 0
  lg?: 1 | 2 | 3 | 4 | 5 | 6 | 0
  xl?: 1 | 2 | 3 | 4 | 5 | 6 | 0
  gap?: string
}>

function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

const map = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
} as const

const mdMap = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
  6: 'md:grid-cols-6',
} as const

const lgMap = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6',
} as const

const xlMap = {
  1: 'xl:grid-cols-1',
  2: 'xl:grid-cols-2',
  3: 'xl:grid-cols-3',
  4: 'xl:grid-cols-4',
  5: 'xl:grid-cols-5',
  6: 'xl:grid-cols-6',
} as const

export default function Grid({
  className,
  cols = 1,
  md = 2,
  lg = 3,
  xl = 4,
  gap = 'gap-6',
  children,
}: GridProps) {
  const base = 'grid'
  const colsClass = map[cols] || map[1]
  const mdClass = md ? mdMap[md as 1 | 2 | 3 | 4 | 5 | 6] : ''
  const lgClass = lg ? lgMap[lg as 1 | 2 | 3 | 4 | 5 | 6] : ''
  const xlClass = xl ? xlMap[xl as 1 | 2 | 3 | 4 | 5 | 6] : ''
  return <div className={cx(base, colsClass, mdClass, lgClass, xlClass, gap, className)}>{children}</div>
}
