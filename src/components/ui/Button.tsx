import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

const variants = {
  primary: 'bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/20',
  secondary: 'bg-elevated hover:bg-border-default text-text-secondary border border-border-subtle',
  danger: 'bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20',
  ghost: 'hover:bg-elevated text-text-secondary',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-sm rounded-xl gap-2',
};

export function Button({ variant = 'primary', size = 'md', loading = false, className = '', disabled, children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] cursor-pointer ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}
