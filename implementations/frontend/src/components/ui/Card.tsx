import { HTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({ children, hover = false, padding = 'md', className, ...props }: CardProps) {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-white rounded-2xl shadow-md',
          paddingClasses[padding],
          hover && 'transition-shadow hover:shadow-lg cursor-pointer',
          className,
        ),
      )}
      {...props}
    >
      {children}
    </div>
  );
}
