import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ 
  message = 'Loading...', 
  size = 'md',
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`text-center ${className}`}>
      <div className={`${sizeClasses[size]} bg-grass-500 rounded-lg shadow-minecraft animate-pulse mb-4 mx-auto`}></div>
      <p className={`font-minecraft text-stone-600 ${textSizeClasses[size]}`}>
        {message}
      </p>
    </div>
  );
}