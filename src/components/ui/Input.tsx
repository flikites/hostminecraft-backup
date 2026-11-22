import React from 'react';

interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  type?: 'text' | 'email' | 'password' | 'number';
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export function Input({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  type = 'text',
  required = false,
  disabled = false,
  error,
  className = '',
}: InputProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-stone-700 font-minecraft">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className={`relative w-full border-2 border-stone-400 rounded-md shadow-minecraft bg-white focus-within:border-grass-500 focus-within:shadow-minecraft-hover transition-all duration-200 ${error ? 'border-red-500 focus-within:border-red-500' : ''}`}>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="w-full px-4 py-3 bg-transparent border-none outline-none font-minecraft text-lg text-minecraft-900 placeholder-stone-400 disabled:bg-stone-100 disabled:cursor-not-allowed transition-colors duration-200"
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 font-minecraft">{error}</p>
      )}
    </div>
  );
}