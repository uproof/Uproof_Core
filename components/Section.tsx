import { PropsWithChildren, ReactNode, ElementType } from 'react'

type SectionVariant = 'plain' | 'muted' | 'band' | 'dark' | 'gradient'
type SectionPadding = 'sm' | 'md' | 'lg' | 'xl'

export type SectionProps = PropsWithChildren<{
  id?: string
  as?: ElementType
  className?: string
  variant?: SectionVariant
  pad?: SectionPadding
  center?: boolean
  title?: ReactNode
  eyebrow?: ReactNode
  subtitle?: ReactNode
  divider?: 'none' | 'top' | 'bottom'
}>

function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

function padClasses(pad: SectionPadding) {
  switch (pad) {
    case 'sm':
      return 'py-8 md:py-10'
    case 'lg':
      return 'py-16 md:py-24'
    case 'xl':
      return 'py-20 md:py-32'
    case 'md':
    default:
      return 'py-12 md:py-16'
  }
}

function variantClasses(variant: SectionVariant) {
  switch (variant) {
    case 'muted':
      return 'bg-gray-50'
    case 'band':
      return 'bg-gradient-to-br from-primary-50 to-white'
    case 'dark':
      return 'bg-gray-900 text-white'
    case 'gradient':
      return 'bg-gradient-to-b from-white via-gray-50 to-white'
    case 'plain':
    default:
      return 'bg-white'
  }
}

export default function Section({
  id,
  as,
  className,
  variant = 'plain',
  pad = 'md',
  center = false,
  title,
  eyebrow,
  subtitle,
  divider = 'none',
  children,
}: SectionProps) {
  const Tag: ElementType = as || 'section'
  return (
    <Tag
      id={id}
      className={cx(
        'relative',
        variantClasses(variant),
        padClasses(pad),
        divider === 'top' && 'border-t border-gray-100',
        divider === 'bottom' && 'border-b border-gray-100',
        className
      )}
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {(title || eyebrow || subtitle) && (
          <div className={cx('mb-10 md:mb-12', center && 'text-center')}>
            {eyebrow && (
              <div className={cx('text-sm font-semibold tracking-wider uppercase', variant === 'dark' ? 'text-primary-300' : 'text-primary-600')}>
                {eyebrow}
              </div>
            )}
            {title && (
              <h2 className={cx('mt-3 text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight', variant === 'dark' ? 'text-white' : 'text-gray-900')}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className={cx('mt-4 text-base md:text-lg leading-relaxed max-w-3xl', variant === 'dark' ? 'text-gray-300' : 'text-gray-600', center && 'mx-auto')}>
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </Tag>
  )
}
