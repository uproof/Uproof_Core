'use client';

import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';
import { Link } from '@/i18n/routing';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'dark';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
}

interface ButtonAsButton extends ButtonBaseProps, ButtonHTMLAttributes<HTMLButtonElement> {
  as?: 'button';
  href?: never;
}

interface ButtonAsLink extends ButtonBaseProps {
  as: 'link';
  href: string;
  children?: ReactNode;
  className?: string;
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-500 shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/30 focus:ring-primary-500',
  secondary: 'bg-gray-900 text-white hover:bg-gray-800 shadow-lg hover:shadow-xl focus:ring-gray-900',
  outline: 'bg-transparent text-gray-900 border-2 border-gray-200 hover:border-gray-900 hover:bg-gray-50 focus:ring-gray-500',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500',
  dark: 'bg-gray-800 text-white hover:bg-gray-700 shadow-lg hover:shadow-xl focus:ring-gray-700',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-2.5 text-sm',
  lg: 'px-8 py-3.5 text-base',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'right',
      loading = false,
      fullWidth = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = cx(
      'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5',
      variantClasses[variant],
      sizeClasses[size],
      fullWidth && 'w-full',
      className
    );

    const iconElement = loading ? (
      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    ) : icon;

    const content = (
      <>
        {iconPosition === 'left' && iconElement}
        {children}
        {iconPosition === 'right' && iconElement}
      </>
    );

    if (props.as === 'link') {
      const { as, href, ...linkProps } = props;
      return (
        <Link href={href} className={baseClasses} {...linkProps}>
          {content}
        </Link>
      );
    }

    const { as, ...buttonProps } = props as ButtonAsButton;
    return (
      <button ref={ref} className={baseClasses} disabled={loading} {...buttonProps}>
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
