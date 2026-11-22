import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  icon?: LucideIcon;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  icon: Icon,
  className = '',
  type = 'button',
}: ButtonProps) {
  const baseClasses = 'font-minecraft font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-grass-500 hover:bg-grass-600 text-white shadow-minecraft hover:shadow-minecraft-hover focus:ring-grass-500',
    secondary: 'bg-stone-500 hover:bg-stone-600 text-white shadow-minecraft hover:shadow-minecraft-hover focus:ring-stone-500',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-minecraft hover:shadow-minecraft-hover focus:ring-red-500',
    ghost: 'bg-transparent hover:bg-stone-100 text-stone-700 border-2 border-stone-300 hover:border-stone-400',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="flex items-center justify-center gap-2">
        {Icon && <Icon className="w-4 h-4" />}
        {children}
      </span>
    </button>
  );
}