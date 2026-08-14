import React from 'react';
import { cn } from '../../utils/cn';

export const LoadingState: React.FC<{ message?: string; className?: string }> = ({
  message = 'Loading healthcare records...',
  className,
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      <div className="relative flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
        <div className="absolute w-5 h-5 bg-brand-50 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-brand-600 rounded-full animate-pulse"></div>
        </div>
      </div>
      <p className="text-xs font-medium text-slate-500 mt-4 tracking-wide">{message}</p>
    </div>
  );
};
