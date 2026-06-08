import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { DAYS, DAYS_SHORT, TRAINING_PHASES, RECOVERY_MUSCLES, RECOVERY_LABELS } from '@/lib/constants'
import { EX_TO_MUSCLE } from '@/lib/exerciseDB'
import { calcVolume, daysBetween, getDayOfWeek, formatDate } from '@/lib/utils'
import { Flame, Trophy, Dumbbell, ChevronRight, Scale, Target, TrendingUp } from 'lucide-react'
import Card, { CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { profile, settings, workouts, prs, program, dayNames, bodyWeightLog, trainingPhase } = useStore()
  const unit = settings.unit
  const todayIdx = getDayOfWeek()
  const todayProg = program[todayIdx] || []

  const phase = TRAINING_PHASES.find(p => p.id === trainingPhase?.phase)

  const streak = useMemo(() => {
    let s = 0
    const sorted = [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date))
    if (!sorted.length) return 0
    let d = new Date(); d.setHours(0, 0, 0, 0)
    for (let i = 0; i < 60; i++) {
      if (sorted.some(w => new Date(w.date).toDateString() === d.toDateString())) s++
      else if (i > 0) break
      d.setDate(d.getDate() - 1)
    }
    return s
  }, [workouts])

  const getWeekVol = (weeksAgo) => {
    const now = new Date()
    const start = new Date(now); start.setDate(start.getDate() - ((now.getDay() + 6) % 7) - 7 * weeksAgo); start.setHours(0, 0, 0, 0)
    const end = new Date(start); end.setDate(end.getDate() + 7)
    return workouts.filter(w => { const d = new Date(w.date); return d >= start && d < end }).reduce((a, w) => a + (w.totalVolume || 0), 0)
  }
  const thisVol = getWeekVol(0)
  const lastVol = getWeekVol(1)
  const volDiff = lastVol > 0 ? Math.round(((thisVol - lastVol) / lastVol) * 100) : 0
  const weekWorkoutCount = useMemo(() => {
    const now = new Date()
    const start = new Date(now); start.setDate(start.getDate() - ((now.getDay() + 6) % 7)); start.setHours(0, 0, 0, 0)
    return workouts.filter(w => new Date(w.date) >= start).length
  }, [workouts])

  const muscleAge = useMemo(() => {
    const last = {}
    const sorted = [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date))
    for (const w of sorted)
      for (const ex of (w.exercises || [])) {
        const m = EX_TO_MUSCLE[ex.exercise] || 'other'
        if (m && !last[m]) last[m] = w.date
      }
    return last
  }, [workouts])

  const lastWeight = bodyWeightLog.length ? bodyWeightLog[bodyWeightLog.length - 1] : null

  const weightProgress = useMemo(() => {
    if (!trainingPhase?.targetWeight || !trainingPhase?.startWeight) return null
    const current = lastWeight?.weight || trainingPhase.startWeight
    const total = Math.abs(trainingPhase.targetWeight - trainingPhase.startWeight)
    const done = Math.abs(current - trainingPhase.startWeight)
    if (total === 0) return null
    return Math.min(Math.round((done / total) * 100), 100)
  }, [trainingPhase, lastWeight])

  return (
    <div className="px-4 pt-5 pb-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-black overflow-hidden flex-shrink-0 shadow-[0_0_20px_rgba(204,204,204,0.12)]">
            <img src="/logo.png" alt="IronLog" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none' }} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-[0.12em] bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent leading-tight">
              IRONLOG
            </h1>
            <p className="text-[11px] text-text-muted mt-0.5">
              {profile?.name ? `Ciao, ${profile.name}` : new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
        {streak > 0 && (
          <div className="text-center bg-gold/8 border border-gold/20 rounded-2xl px-3.5 py-2 animate-scale-spring">
            <div className="text-xl font-black text-gold leading-none">{streak}</div>
            <div className="text-[9px] text-gold/80 flex items-center gap-1 justify-center mt-0.5">
              <Flame size={9} /> streak
            </div>
          </div>
        )}
      </div>

      <div className="stagger-up">
        {/* Training phase card */}
        {phase && (
          <Card className="mb-3" hover onClick={() => navigate('/app/settings')}
            style={{ borderColor: `${phase.color}25`, background: `linear-gradient(135deg, var(--color-bg-card), ${phase.color}06)` }}>
            <div className="flex items-center gap-3">
              <div className="text-2xl">{phase.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold" style={{ color: phase.color }}>{phase.label}</span>
                  {trainingPhase.startDate && (
                    <span className="text-[9px] text-text-muted bg-bg-surface px-2 py-0.5 rounded-full">
                      da {formatDate(trainingPhase.startDate)}
                    </span>
                  )}
                </div>
                {trainingPhase.targetWeight && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[11px] text-text-muted">
                      {lastWeight ? `${lastWeight.weight}` : trainingPhase.startWeight} → {trainingPhase.targetWeight} {unit}
                    </span>
                    {weightProgress !== null && (
                      <div className="flex-1 h-1 bg-bg-surface rounded-full overflow-hidden max-w-[80px]">
                        <div className="h-full rounded-full transition-all duration-700 animate-progress-grow" style={{ width: `${weightProgress}%`, background: phase.color }} />
                      </div>
                    )}
                  </div>
                )}
              </div>
              <ChevronRight size={14} className="text-text-muted" />
            </div>
          </Card>
        )}

        {/* Today card */}
        {todayProg.length > 0 ? (
          <Card hover onClick={() => navigate('/app/workout')}
            className="mb-3 border-accent/20 bg-gradient-to-br from-bg-card to-accent/[0.03]">
            <CardTitle>{dayNames[todayIdx] ? `${dayNames[todayIdx].toUpperCase()} — ` : ''}{DAYS[todayIdx].toUpperCase()}</CardTitle>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-text-muted">{todayProg.length} esercizi · {todayProg.reduce((a, e) => a + (e.setDefs?.length || e.sets || 0), 0)} serie</div>
              <div className="text-xs font-semibold text-accent flex items-center gap-1 group-hover:gap-2 transition-all">
                INIZIA <ChevronRight size={14} />
              </div>
            </div>
            {todayProg.slice(0, 4).map((ex, i) => (
              <div key={ex.id} className="flex justify-between py-2 border-t border-border/50"
                style={{ animationDelay: `${i * 40}ms` }}>
                <span className="text-sm">{ex.exercise}</span>
                <span className="text-xs font-mono text-text-muted">{ex.sets}×{ex.repRange}</span>
              </div>
            ))}
            {todayProg.length > 4 && <div className="text-xs text-text-muted mt-1.5">+{todayProg.length - 4} esercizi</div>}
          </Card>
        ) : (
          <Card hover onClick={() => navigate('/app/workout')} className="mb-3">
            <CardTitle>OGGI — {DAYS[todayIdx].toUpperCase()}</CardTitle>
            <div className="text-center py-4">
              <div className="text-sm text-text-muted mb-2">Nessun esercizio programmato</div>
              <div className="text-xs text-accent font-semibold">Crea il tuo programma o allenati libero →</div>
            </div>
          </Card>
        )}

        {/* Weekly strip */}
        <Card className="mb-3">
          <CardTitle>SETTIMANA</CardTitle>
          <div className="flex gap-1.5">
            {DAYS_SHORT.map((day, i) => {
              const hasProgram = (program[i] || []).length > 0
              const isToday = i === todayIdx
              const hasWO = workouts.some(w => {
                const d = new Date(w.date)
                const n = new Date(); n.setDate(n.getDate() - (todayIdx - i))
                return d.toDateString() === n.toDateString()
              })
              return (
                <div key={day} className={`flex-1 text-center rounded-xl py-2 px-0.5 border transition-all duration-300 ${
                  isToday ? 'bg-accent/10 border-accent/30 shadow-[0_0_12px_rgba(204,204,204,0.12)]'
                  : hasWO ? 'bg-success/8 border-success/20'
                  : 'border-border'
                }`}>
                  <div className={`text-[10px] font-bold ${isToday ? 'text-accent' : 'text-text-muted'}`}>{day}</div>
                  <div className="mt-1">
                    {hasWO ? (
                      <div className="w-2 h-2 rounded-full bg-success mx-auto transition-all" />
                    ) : hasProgram ? (
                      <div className="w-2 h-2 rounded-full bg-accent/30 mx-auto" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-text-muted/8 mx-auto" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <Card className="text-center !p-3.5">
            <div className="text-lg font-black text-accent font-mono animate-count-up">{weekWorkoutCount}</div>
            <div className="text-[9px] text-text-muted font-semibold tracking-[0.15em]">SESSIONI</div>
          </Card>
          <Card className="text-center !p-3.5">
            <div className="text-lg font-black text-gold font-mono animate-count-up" style={{ animationDelay: '80ms' }}>{(thisVol / 1000).toFixed(1)}t</div>
            <div className="text-[9px] text-text-muted font-semibold tracking-[0.15em]">VOLUME</div>
          </Card>
          <Card className="text-center !p-3.5">
            <div className={`text-lg font-black font-mono animate-count-up ${volDiff >= 0 ? 'text-success' : 'text-danger'}`}
              style={{ animationDelay: '160ms' }}>
              {lastVol > 0 ? `${volDiff >= 0 ? '+' : ''}${volDiff}%` : '—'}
            </div>
            <div className="text-[9px] text-text-muted font-semibold tracking-[0.15em]">VS PREC.</div>
          </Card>
        </div>

        {/* Muscle grid */}
        <Card className="mb-3">
          <CardTitle>RECUPERO MUSCOLARE</CardTitle>
          <div className="grid grid-cols-4 gap-1.5">
            {RECOVERY_MUSCLES.map((m, i) => {
              const last = muscleAge[m]
              const days = last ? daysBetween(last, new Date().toISOString()) : 99
              const color = !last ? 'text-text-muted/30 bg-bg-surface' : days <= 2 ? 'text-success bg-success/8' : days <= 4 ? 'text-gold bg-gold/8' : 'text-danger bg-danger/8'
              return (
                <div key={m} className={`rounded-xl py-2 px-1 text-center transition-all duration-300 ${color}`}
                  style={{ animationDelay: `${i * 30}ms` }}>
                  <div className="text-[9px] font-bold tracking-wide uppercase">{RECOVERY_LABELS[m]?.slice(0, 4)}</div>
                  <div className="text-[9px] text-text-muted mt-0.5">{last ? days === 0 ? 'oggi' : `${days}g` : '—'}</div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Body weight */}
        {lastWeight && (
          <Card className="mb-3" hover onClick={() => navigate('/app/settings')}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal/10 border border-teal/15 flex items-center justify-center">
                <Scale size={16} className="text-teal" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold">{lastWeight.weight} {unit}</div>
                <div className="text-[10px] text-text-muted">Peso corporeo · {formatDate(lastWeight.date)}</div>
              </div>
              <ChevronRight size={14} className="text-text-muted" />
            </div>
          </Card>
        )}

        {/* PRs */}
        {prs.length > 0 && (
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={14} className="text-gold" />
              <CardTitle className="!mb-0">PERSONAL RECORDS</CardTitle>
            </div>
            {prs.slice(0, 5).map((pr, i) => (
              <div key={pr.id} className="flex justify-between items-center py-2.5 border-b border-border/50 last:border-0"
                style={{ animationDelay: `${i * 50}ms` }}>
                <div>
                  <div className="text-sm font-bold">{pr.exercise}</div>
                  <div className="text-[10px] text-text-muted">{formatDate(pr.date)}</div>
                </div>
                <div className="text-right">
                  <div className="shimmer font-mono font-bold text-sm">{pr.weight}{unit}×{pr.reps}</div>
                  <div className="text-[10px] text-gold/80">e1RM {pr.rm}{unit}</div>
                </div>
              </div>
            ))}
          </Card>
        )}

        {/* Empty state */}
        {workouts.length === 0 && prs.length === 0 && (
          <Card className="text-center py-12">
            <div className="animate-float">
              <Dumbbell size={40} className="text-text-muted/20 mx-auto mb-4" />
            </div>
            <div className="text-lg font-bold text-text-muted mb-3">Nessun allenamento ancora</div>
            <Button onClick={() => navigate('/app/workout')} size="lg">Inizia il primo</Button>
          </Card>
        )}
      </div>
    </div>
  )
}
