import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Modal({ open, onClose, children, className }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  // Use createPortal to render at document.body level, avoiding any ancestor
  // with CSS transform that would break position:fixed positioning.
  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-5"
      style={{ touchAction: 'manipulation' }}
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md animate-overlay-fade"
        onClick={onClose}
        style={{ touchAction: 'manipulation' }}
      />
      <div
        className={cn(
          'relative glass-strong rounded-3xl p-7 w-full max-w-sm',
          'animate-modal-reveal glow-soft',
          className
        )}
        style={{ touchAction: 'manipulation', zIndex: 201 }}
      >
        {onClose && (
          <button
            onClick={onClose}
            type="button"
            style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-text-muted hover:text-text-primary transition-all duration-200"
          >
            <X size={14} />
          </button>
        )}
        {children}
      </div>
    </div>,
    document.body
  )
}
