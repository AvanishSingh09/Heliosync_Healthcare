import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  bordered?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  children,
  hover = false,
  bordered = true,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl p-6 shadow-subtle',
        bordered && 'border border-slate-100',
        hover && 'transition-all duration-200 hover:shadow-card hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn('flex items-center justify-between pb-4 mb-4 border-b border-slate-100', className)} {...props}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <h3 className={cn('text-base font-semibold text-slate-900 tracking-tight', className)} {...props}>
      {children}
    </h3>
  );
};
