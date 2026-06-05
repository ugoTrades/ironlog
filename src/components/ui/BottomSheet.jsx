import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function BottomSheet({ open, onClose, title, children, className }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-[200] flex flex-col">
      <div className="flex-1 bg-black/60 backdrop-blur-md animate-overlay-fade" onClick={onClose} />
      <div className={cn(
        'glass-strong rounded-t-3xl max-h-[88vh] flex flex-col',
        'animate-sheet-up',
        className
      )}>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/12" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
          <h3 className="text-base font-bold">{title}</h3>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-text-muted hover:text-text-primary transition-all duration-200">
            <X size={14} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>
      </div>
    </div>
  )
}
