import { cn } from '@/lib/utils'

export default function Stepper({ value, onChange, step = 2.5, min = 0, label, unit, big }) {
  return (
    <div className="flex flex-col items-center gap-1">
      {label && (
        <span className="text-[10px] font-semibold text-text-muted tracking-widest uppercase">{label}</span>
      )}
      <div className="flex items-center bg-bg-surface rounded-xl border border-border overflow-hidden">
        <button
          onClick={() => onChange(Math.max(min, Math.round((value - step) * 100) / 100))}
          className={cn(
            'flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors',
            big ? 'w-11 h-[52px] text-xl' : 'w-9 h-11 text-lg'
          )}
        >
          -
        </button>
        <div className={cn(
          'text-center font-mono font-bold text-text-primary px-1',
          big ? 'min-w-16 text-xl' : 'min-w-13 text-base'
        )}>
          {value}
          {unit && <span className="text-[10px] text-text-muted ml-0.5">{unit}</span>}
        </div>
        <button
          onClick={() => onChange(Math.round((value + step) * 100) / 100))}
          className={cn(
            'flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors',
            big ? 'w-11 h-[52px] text-xl' : 'w-9 h-11 text-lg'
          )}
        >
          +
        </button>
      </div>
    </div>
  )
}
