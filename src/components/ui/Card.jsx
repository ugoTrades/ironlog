import { cn } from '@/lib/utils'

export default function Card({ children, className, hover, onClick, glow, ...props }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'glass rounded-2xl p-4 transition-all duration-300',
        hover && 'hover:bg-bg-card-hover hover:border-border-strong hover-lift cursor-pointer',
        onClick && 'cursor-pointer tap-scale',
        glow && 'glow-accent border-border-glow',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardTitle({ children, className }) {
  return (
    <p className={cn(
      'text-[10px] font-semibold text-text-muted tracking-[0.2em] uppercase mb-3',
      className
    )}>
      {children}
    </p>
  )
}
