'use client'

import { useTranslations } from 'next-intl';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export default function LoadingSpinnerWithText({ size = 'md', className = '', text }: LoadingSpinnerProps) {
  const t = useTranslations('common');
  const sizeClasses = {
    sm: 'h-4 w-4 border-b-1',
    md: 'h-8 w-8 border-b-2',
    lg: 'h-12 w-12 border-b-3',
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 pb-16 pt-20 flex items-center justify-center flex-col">
        <div className={`flex items-center justify-center ${className}`}>
          <div className={`animate-spin rounded-full ${sizeClasses[size]} border-purple-500`}></div>
        </div>
        <p className="mt-4 text-center text-gray-600 font-medium">{text ?? t('please_stay')}</p>
      </div>
    </div>
  );
}
