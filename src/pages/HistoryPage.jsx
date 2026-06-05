import { useState, useMemo } from 'react'
import { useStore } from '@/store/useStore'
import { formatDate, formatDateFull, formatTime, calcVolume } from '@/lib/utils'
import { DAYS } from '@/lib/constants'
import { Calendar, ChevronDown, ChevronUp, Copy } from 'lucide-react'
import Card, { CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

function CalHeatmap({ workouts }) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const volByDate = {}
  workouts.forEach(w => {
    const k = new Date(w.date).toDateString()
    volByDate[k] = (volByDate[k] || 0) + (w.totalVolume || 0)
  })
  const maxV = Math.max(...Object.values(volByDate), 1)
  const weeks = 14
  const start = new Date(today); start.setDate(start.getDate() - weeks * 7 + 1)
  const cols = []
  for (let w = 0; w < weeks; w++) {
    const col = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(start); date.setDate(start.getDate() + w * 7 + d)
      const k = date.toDateString()
      const vol = volByDate[k] || 0
      col.push({ date, vol, int: vol > 0 ? Math.max(0.15, vol / maxV) : 0, isToday: date.toDateString() === today.toDateString() })
    }
    cols.push(col)
  }

  return (
    <div>
      <div className="flex gap-[3px] overflow-x-auto pb-1">
        {cols.map((col, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {col.map((c, di) => (
              <div key={di}
                title={`${c.date.toLocaleDateString('it-IT')}: ${(c.vol / 1000).toFixed(1)}t`}
                className={`w-[13px] h-[13px] rounded-[3px] flex-shrink-0 transition-all duration-300 ${c.isToday ? 'ring-1 ring-accent ring-offset-1 ring-offset-bg' : ''}`}
                style={{ background: c.vol > 0 ? `rgba(6,182,212,${c.int})` : 'rgba(255,255,255,0.03)' }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 mt-2 justify-end">
        <span className="text-[9px] text-text-muted">Meno</span>
        {[0.05, 0.2, 0.4, 0.7, 1].map(i => (
          <div key={i} className="w-[9px] h-[9px] rounded-[3px]" style={{ background: `rgba(6,182,212,${i})` }} />
        ))}
        <span className="text-[9px] text-text-muted">Più</span>
      </div>
    </div>
  )
}

export default function HistoryPage() {
  const { workouts, settings, duplicateWorkout } = useStore()
  const unit = settings.unit
  const [open, setOpen] = useState(null)
  const [monthFilter, setMonthFilter] = useState('all')
  const sorted = useMemo(() => [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date)), [workouts])

  const months = useMemo(() => {
    const m = new Set()
    workouts.forEach(w => {
      m.add(new Date(w.date).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }))
    })
    return ['all', ...m]
  }, [workouts])

  const filtered = monthFilter === 'all' ? sorted : sorted.filter(w =>
    new Date(w.date).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }) === monthFilter
  )

  return (
    <div className="px-4 pt-5 pb-4">
      <h2 className="text-2xl font-bold tracking-wide mb-5 animate-fade-in">STORICO</h2>

      <div className="stagger-up">
        <Card className="mb-4">
          <CardTitle>HEATMAP ALLENAMENTI</CardTitle>
          <CalHeatmap workouts={workouts} />
        </Card>

        {months.length > 2 && (
          <div className="flex gap-1.5 overflow-x-auto pb-3 mb-3">
            {months.map(m => (
              <button key={m} onClick={() => setMonthFilter(m)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-semibold border transition-all duration-300 capitalize ${
                  monthFilter === m ? 'bg-accent/10 border-accent/30 text-accent' : 'bg-bg-surface border-border text-text-muted hover:border-border-strong'
                }`}>{m === 'all' ? 'Tutti' : m}</button>
            ))}
          </div>
        )}

        <CardTitle>ALLENAMENTI ({filtered.length})</CardTitle>

        {sorted.length === 0 && (
          <Card className="text-center py-14">
            <div className="animate-float">
              <Calendar size={40} className="text-text-muted/20 mx-auto mb-4" />
            </div>
            <div className="text-text-muted">Nessun allenamento salvato.</div>
          </Card>
        )}

        {filtered.map((w, wi) => {
          const isOpen = open === w.id
          const vol = (w.totalVolume || 0) / 1000
          return (
            <Card key={w.id} className="mb-2">
              <button onClick={() => setOpen(isOpen ? null : w.id)}
                className="w-full text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold">
                      {w.splitDay || (w.dayIndex !== undefined && w.dayIndex !== 'free' ? DAYS[w.dayIndex] : 'Allenamento')}
                      <span className="text-text-muted font-normal text-xs ml-2">{formatDateFull(w.date)}</span>
                    </div>
                    <div className="flex gap-3 text-[11px] text-text-muted mt-1">
                      <span>{w.exercises?.length || 0} esercizi</span>
                      <span className="font-mono">{vol.toFixed(1)}t</span>
                      {w.duration && <span>{formatTime(w.duration)}</span>}
                    </div>
                  </div>
                  <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown size={14} className="text-text-muted" />
                  </div>
                </div>
              </button>

              {isOpen && (
                <div className="mt-3 pt-3 border-t border-border/50 animate-fade-in">
                  {w.exercises?.map(ex => {
                    const sets = ex.sets?.filter(s => s.reps > 0) || []
                    if (!sets.length) return null
                    const best = [...sets].sort((a, b) => b.weight - a.weight)[0]
                    return (
                      <div key={ex.id} className="mb-3">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-sm font-bold">{ex.exercise}</span>
                          {best && <span className="text-xs font-mono text-gold">{best.weight}{unit}×{best.reps}</span>}
                        </div>
                        {sets.map((s, i) => (
                          <div key={s.id || i} className="flex items-center gap-2 py-1 text-xs text-text-muted border-t border-border/20">
                            <span className="w-5 text-center font-mono text-[10px]">{s.setNum}</span>
                            <span className="font-mono">
                              {s.weight > 0 ? `${s.weight}${unit}` : 'BW'} × {s.reps}
                            </span>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                  <Button size="sm" variant="ghost" onClick={() => duplicateWorkout(w.id)} className="mt-1">
                    <Copy size={13} /> Duplica workout
                  </Button>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
