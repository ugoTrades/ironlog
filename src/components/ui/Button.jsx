import { cn } from '@/lib/utils'

const variants = {
  primary: 'bg-accent text-white hover:bg-accent-light shadow-lg shadow-accent/20 border border-accent/20 active:shadow-accent/30',
  secondary: 'glass text-text-secondary hover:text-text-primary hover:bg-bg-elevated hover:border-border-strong',
  danger: 'bg-danger/90 text-white hover:bg-danger border border-danger/20 shadow-lg shadow-danger/15',
  ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/5',
  gold: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold shadow-lg shadow-amber-500/20 border border-amber-400/20',
}

const sizes = {
  sm: 'px-3.5 py-1.5 text-xs rounded-xl',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-8 py-3.5 text-sm rounded-2xl',
  xl: 'px-10 py-4 text-base tracking-wide rounded-2xl',
}

export default function Button({
  children, variant = 'primary', size = 'md',
  className, disabled, type, ...props
}) {
  return (
    <button
      type={type || 'button'}
      disabled={disabled}
      style={{
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
        cursor: 'pointer',
      }}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold select-none',
        'transition-opacity duration-150 tap-scale',
        'disabled:opacity-35 disabled:cursor-not-allowed',
        variants[variant], sizes[size], className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
