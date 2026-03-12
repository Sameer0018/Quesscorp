import React from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

const variants: Record<Variant, string> = {
  primary: 'bg-slate-800 text-white hover:bg-slate-700',
  secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

export default function Button({ variant = 'primary', loading, disabled, className = '', children, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 min-w-[5rem] px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : (
        children
      )}
    </button>
  );
}
