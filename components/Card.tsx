import { PropsWithChildren, ReactNode, ElementType } from 'react'

type CardVariant = 'default' | 'muted' | 'accent' | 'outlined' | 'dark' | 'glass'

export type CardProps = PropsWithChildren<{
  as?: ElementType
  className?: string
  variant?: CardVariant
  hover?: boolean
  title?: ReactNode
  subtitle?: ReactNode
}>

function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

function variantClasses(variant: CardVariant) {
  switch (variant) {
    case 'muted':
      return 'bg-gray-50 border border-gray-100'
    case 'accent':
      return 'bg-gradient-to-br from-primary-50 to-white border border-primary-100'
    case 'outlined':
      return 'bg-white border border-gray-200'
    case 'dark':
      return 'bg-gray-900 text-white border border-gray-800'
    case 'glass':
      return 'bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-soft'
    case 'default':
    default:
      return 'bg-white shadow-card border border-gray-100'
  }
}

export default function Card({
  as,
  className,
  variant = 'default',
  hover = true,
  title,
  subtitle,
  children,
}: CardProps) {
  const Tag: ElementType = as || 'div'
  return (
    <Tag
      className={cx(
        'card rounded-xl p-6 transition-all duration-300',
        variantClasses(variant),
        hover && 'hover:shadow-card-hover hover:-translate-y-1 hover:border-gray-200',
        className
      )}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className={cx('text-lg font-semibold tracking-tight', variant === 'dark' ? 'text-white' : 'text-gray-900')}>{title}</h3>}
          {subtitle && <p className={cx('mt-1 text-sm', variant === 'dark' ? 'text-gray-400' : 'text-gray-600')}>{subtitle}</p>}
        </div>
      )}
      {children}
    </Tag>
  )
}
