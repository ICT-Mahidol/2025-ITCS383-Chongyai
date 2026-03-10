import { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary hover:bg-primary-dark text-white focus:ring-primary',
  secondary: 'bg-accent hover:bg-accent-dark text-white focus:ring-accent',
  outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary',
  ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-300',
  danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500',
};

const sizeClasses: Record<Size, string> = {
  sm: 'py-1.5 px-3 text-sm',
  md: 'py-2 px-4 text-base',
  lg: 'py-3 px-6 text-lg',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled ?? isLoading}
      className={twMerge(
        clsx(
          'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          className,
        ),
      )}
      {...props}
    >
      {isLoading && <Spinner size="sm" />}
      {children}
    </button>
  );
}
