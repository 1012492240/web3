interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-b-1',
    md: 'h-8 w-8 border-b-2',
    lg: 'h-12 w-12 border-b-3',
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 pb-16 pt-20 flex items-center justify-center">
        <div className={`flex items-center justify-center ${className}`}>
          <div className={`animate-spin rounded-full ${sizeClasses[size]} border-purple-500`}></div>
        </div>
      </div>
    </div>
  );
}
