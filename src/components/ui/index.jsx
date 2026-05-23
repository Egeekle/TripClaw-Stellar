import React from 'react';

/**
 * Premium Button Component
 * Supports variants: primary, secondary, outline, ghost
 */
export function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  className = '',
  icon = null,
  loading = false,
  ...props 
}) {
  const baseStyles = "inline-flex items-center justify-center font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none rounded-xl tracking-tight";
  
  const variants = {
    primary: "bg-gradient-primary text-white shadow-lg shadow-primary/20 hover:shadow-primary/40",
    secondary: "bg-white dark:bg-white/10 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/20",
    outline: "bg-transparent border-2 border-primary text-primary hover:bg-primary/5",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20"
  };

  const sizes = {
    sm: "h-9 px-4 text-xs",
    md: "h-11 px-6 text-sm",
    lg: "h-14 px-8 text-base",
    icon: "size-11 rounded-full p-0"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="material-symbols-outlined animate-spin mr-2 text-[20px]">progress_activity</span>
      ) : icon && (
        <span className={`material-symbols-outlined ${children ? 'mr-2' : ''} text-[20px]`}>{icon}</span>
      )}
      {children}
    </button>
  );
}

/**
 * Standard Card Component
 */
export function Card({ children, className = '', padded = true, hoverable = false }) {
  return (
    <div className={`bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-sm ${padded ? 'p-5' : ''} ${hoverable ? 'hover:shadow-md hover:border-primary/45 dark:hover:border-primary/45 transition-all' : ''} ${className}`}>
      {children}
    </div>
  );
}

/**
 * Badge Component
 */
export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400",
    primary: "bg-primary/10 dark:bg-primary/20 text-primary border border-primary/20",
    success: "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    warning: "bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
    danger: "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400"
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

