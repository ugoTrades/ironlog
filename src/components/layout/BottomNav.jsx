import { NavLink, useLocation } from 'react-router-dom'
import { Activity, Dumbbell, BarChart2, Calendar, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/store/useStore'
import { hapticLight } from '@/lib/haptics'

const items = [
  { to: '/app', icon: Activity, label: 'Home', end: true },
  { to: '/app/workout', icon: Dumbbell, label: 'Workout' },
  { to: '/app/stats', icon: BarChart2, label: 'Stats' },
  { to: '/app/history', icon: Calendar, label: 'Storico' },
  { to: '/app/settings', icon: Settings, label: 'Altro' },
]

export default function BottomNav() {
  const hasWorkout = useStore(s => !!s.currentWorkout)
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 glass-nav pb-safe">
      <div className="flex items-center h-[62px]">
        {items.map(({ to, icon: Icon, label, end }) => {
          const isActive = end
            ? location.pathname === to
            : location.pathname.startsWith(to)
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => hapticLight()}
              className="flex-1 flex flex-col items-center justify-center gap-1.5 py-2 relative group tap-scale"
            >
              <div className="relative">
                <div className={cn(
                  'transition-all duration-300',
                  isActive && 'drop-shadow-[0_0_10px_rgba(204,204,204,0.4)]'
                )}>
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.2 : 1.6}
                    className={cn(
                      'transition-all duration-300',
                      isActive ? 'text-accent' : 'text-text-muted group-hover:text-text-secondary'
                    )}
                  />
                </div>
                {label === 'Workout' && hasWorkout && (
                  <span className="absolute -top-0.5 -right-1.5 w-2 h-2 rounded-full bg-success animate-breathe" />
                )}
              </div>
              <span className={cn(
                'text-[9px] font-medium tracking-wider transition-all duration-300',
                isActive ? 'text-accent' : 'text-text-muted group-hover:text-text-secondary'
              )}>
                {label}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-accent rounded-full shadow-[0_0_8px_rgba(204,204,204,0.5)] animate-scale-in" />
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
