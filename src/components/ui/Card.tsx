import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'minecraft';
}

export function Card({ children, className = '', variant = 'default' }: CardProps) {
  const baseClasses = 'bg-white rounded-lg overflow-hidden';
  const variantClasses = {
    default: 'shadow-lg border border-stone-200',
    minecraft: 'shadow-minecraft border-4 border-stone-400',
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-4 border-b border-stone-200 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-4 border-t border-stone-200 ${className}`}>
      {children}
    </div>
  );
}