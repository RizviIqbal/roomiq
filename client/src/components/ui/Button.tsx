import React from 'react';
import { Spinner } from './Spinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  readonly size?: 'sm' | 'md' | 'lg';
  readonly loading?: boolean;
  readonly fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  fullWidth,
  className = '',
  ...props
}) => {
  const sizes = {
    sm: 'h-9 px-5 text-[11px] gap-2',
    md: 'h-12 px-8 text-[13px] gap-2.5',
    lg: 'h-14 px-10 text-[14px] gap-3',
  };

  const variants = {
    primary: [
      'bg-white text-obsidian font-semibold',
      'shadow-[0_0_20px_rgba(255,255,255,0.3)]',
      'hover:bg-gray-100 hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] hover:scale-[1.02]',
    ].join(' '),
    secondary: [
      'bg-glass text-white border border-glass-border backdrop-blur-md',
      'shadow-glass',
      'hover:bg-glass-hover hover:border-white/20 hover:shadow-glow hover:scale-[1.02]',
    ].join(' '),
    danger: [
      'bg-accent-rose/10 text-accent-rose border border-accent-rose/20',
      'hover:bg-accent-rose/20 hover:border-accent-rose/40 hover:shadow-[0_0_15px_rgba(225,29,72,0.3)] hover:scale-[1.02]',
    ].join(' '),
    ghost: [
      'bg-transparent text-primary-muted border border-transparent',
      'hover:text-white hover:bg-white/5',
    ].join(' '),
    success: [
      'bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20',
      'hover:bg-accent-emerald/20 hover:border-accent-emerald/40 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-[1.02]',
    ].join(' '),
  };

  return (
    <button
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center font-display tracking-wide rounded-full',
        'transition-all duration-300 whitespace-nowrap cursor-pointer active:scale-[0.98]',
        sizes[size], 
        variants[variant],
        fullWidth ? 'w-full' : '',
        (disabled || loading) ? 'opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-none' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {loading && <Spinner size={16} color="currentColor" />}
      {children}
    </button>
  );
};

export default Button;
