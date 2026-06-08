import { useState, useEffect, useRef, useMemo } from 'react'
import { useStore } from '@/store/useStore'
import { DAYS, DAYS_SHORT, SET_TYPES, EX_TO_MUSCLE } from '@/lib/constants'
import { calcVolume, formatTime, cn, getDayOfWeek } from '@/lib/utils'
import {
  Clock, Check, Plus, Trash2, X, ChevronUp, ChevronDown,
  Trophy, Play, Pause, RotateCcw, MessageSquare, Edit2, Bell,
  Flame, Repeat, ArrowUp, ArrowDown, StickyNote, ArrowLeftRight
} from 'lucide-react'
import Card, { CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import ExercisePicker from '@/components/workout/ExercisePicker'
import { hapticLight, hapticMedium, hapticSuccess, hapticWarning } from '@/lib/haptics'
import { playTimerEndAlert, unlockAudio, requestNotificationPermission } from '@/lib/timerAlert'

function RestTimer() {
  const defaultTime = useStore(s => s.settings.restTimerDefault || 120)
  const updateSettings = useStore(s => s.updateSettings)
  const [time, setTime] = useState(defaultTime)
  const [running, setRunning] = useState(false)
  const [initial, setInitial] = useState(defaultTime)
  const [editing, setEditing] = useState(false)
  const [customMin, setCustomMin] = useState(Math.floor(defaultTime / 60))
  const [customSec, setCustomSec] = useState(defaultTime % 60)
  const ref = useRef(null)
  const firedRef = useRef(false)

  useEffect(() => { setInitial(defaultTime); setTime(defaultTime) }, [defaultTime])

  useEffect(() => {
    if (running && time > 0) {
      ref.current = setInterval(() => setTime(t => t - 1), 1000)
      return () => clearInterval(ref.current)
    }
    if (running && time <= 0 && !firedRef.current) {
      firedRef.current = true
      playTimerEndAlert()
      hapticWarning()
      setRunning(false)
      setTime(initial)
      setTimeout(() => { firedRef.current = false }, 1000)
    }
  }, [running, time, initial])

  const pct = (time / initial) * 100

  const handleToggle = () => {
    unlockAudio()
    if (!running) requestNotificationPermission().catch(() => {})
    setRunning(!running)
  }

  const applyCustom = () => {
    const total = Math.max(5, Math.min(3600, (customMin * 60) + customSec))
    setInitial(total)
    setTime(total)
    setRunning(false)
    updateSettings({ restTimerDefault: total })
    setEditing(false)
  }

  return (
    <div className="bg-bg-surface/80 rounded-xl border border-border">
      <div className="flex items-center gap-2 px-2.5 py-2">
        <button onClick={handleToggle}
          className={cn('w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300',
            running ? 'bg-danger/15 text-danger' : 'bg-accent/15 text-accent',
            running && 'animate-breathe')}>
          {running ? <Pause size={12} /> : <Play size={12} />}
        </button>
        <div className="flex-1">
          <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
            <div className={cn('h-full rounded-full transition-all duration-1000 ease-linear',
              time <= 10 ? 'bg-danger' : 'bg-accent'
            )} style={{ width: `${pct}%` }} />
          </div>
        </div>
        <button onClick={() => setEditing(v => !v)}
          className={cn('text-xs font-mono font-bold min-w-[44px] text-center transition-colors px-1 py-0.5 rounded',
            editing ? 'text-accent bg-accent/10' : time <= 10 && running ? 'text-danger' : 'text-text-muted hover:text-text-primary'
          )}>{formatTime(time)}</button>
        <button onClick={() => { setRunning(false); setTime(initial); firedRef.current = false }} className="text-text-muted p-1 hover:text-text-primary transition-colors">
          <RotateCcw size={12} />
        </button>
      </div>

      {editing ? (
        <div className="px-2.5 pb-2 animate-fade-in">
          <div className="flex items-center gap-1.5">
            <div className="flex-1 flex items-center bg-bg-elevated rounded-lg border border-border overflow-hidden">
              <button onClick={() => setCustomMin(m => Math.max(0, m - 1))} className="w-7 h-8 text-text-muted text-base">−</button>
              <input type="number" min="0" max="59" value={customMin}
                onChange={e => setCustomMin(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                className="w-10 text-center bg-transparent font-mono font-bold text-xs" />
              <span className="text-[9px] text-text-muted pr-1">min</span>
              <button onClick={() => setCustomMin(m => Math.min(59, m + 1))} className="w-7 h-8 text-text-muted text-base">+</button>
            </div>
            <span className="text-text-muted font-mono">:</span>
            <div className="flex-1 flex items-center bg-bg-elevated rounded-lg border border-border overflow-hidden">
              <button onClick={() => setCustomSec(s => Math.max(0, s - 5))} className="w-7 h-8 text-text-muted text-base">−</button>
              <input type="number" min="0" max="59" value={customSec}
                onChange={e => setCustomSec(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                className="w-10 text-center bg-transparent font-mono font-bold text-xs" />
              <span className="text-[9px] text-text-muted pr-1">sec</span>
              <button onClick={() => setCustomSec(s => Math.min(59, s + 5))} className="w-7 h-8 text-text-muted text-base">+</button>
            </div>
            <button onClick={applyCustom}
              className="h-8 px-2.5 rounded-lg bg-accent text-bg text-[10px] font-bold">OK</button>
          </div>
          <div className="flex gap-0.5 mt-1.5">
            {[45, 60, 90, 120, 150, 180, 240, 300].map(t => (
              <button key={t} onClick={() => { setInitial(t); setTime(t); setCustomMin(Math.floor(t / 60)); setCustomSec(t % 60); setRunning(false); updateSettings({ restTimerDefault: t }); setEditing(false) }}
                className={cn('flex-1 text-[9px] py-1 rounded font-mono transition-all',
                  initial === t ? 'bg-accent/15 text-accent' : 'text-text-muted hover:text-text-primary bg-bg-elevated'
                )}>{t < 60 ? `${t}s` : `${Math.floor(t / 60)}'${t % 60 ? `${t % 60}` : ''}`}</button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function SetRow({ set, exId, unit }) {
  const { updateSet, toggleSetDone, removeSet } = useStore()
  const [editWeight, setEditWeight] = useState(false)
  const st = SET_TYPES.find(t => t.id === set.setType) || SET_TYPES[0]

  return (
    <div className={cn(
      'flex items-center gap-2 py-2.5 border-b border-border/30 last:border-0 transition-all duration-300 rounded-xl px-1.5',
      set.done && 'bg-success/[0.04]'
    )}>
      <button onClick={() => { toggleSetDone(exId, set.id); set.done ? hapticLight() : hapticSuccess() }}
        className={cn(
          'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border transition-all duration-300',
          set.done ? 'bg-success border-success scale-100' : 'bg-bg-surface border-border'
        )}
        style={!set.done ? { borderColor: `${st.color}40`, background: `${st.color}10` } : {}}>
        {set.done
          ? <Check size={13} className="text-black animate-check-pop" />
          : <span className="text-[11px] font-mono font-bold" style={{ color: st.color }}>{set.setNum}</span>
        }
      </button>
      <div className="flex flex-col items-start min-w-[42px]">
        <span className="text-[8px] font-bold uppercase leading-none" style={{ color: st.color }}>{st.label.slice(0, 5)}</span>
        {set.repRange && <span className="text-[8px] text-text-muted font-mono">{set.repRange}</span>}
      </div>
      <div className="flex-1">
        {editWeight ? (
          <div className="flex items-center bg-bg-surface rounded-xl border border-accent/30 overflow-hidden animate-scale-in">
            <button onClick={() => updateSet(exId, set.id, { weight: Math.max(0, Math.round((set.weight - 2.5) * 10) / 10) })}
              className="w-8 h-9 text-text-muted hover:text-text-primary text-lg transition-colors">-</button>
            <input type="number" value={set.weight || ''} onChange={e => updateSet(exId, set.id, { weight: parseFloat(e.target.value) || 0 })}
              className="w-14 text-center bg-transparent font-mono font-bold text-sm" autoFocus
              onBlur={() => setEditWeight(false)} />
            <button onClick={() => updateSet(exId, set.id, { weight: Math.round((set.weight + 2.5) * 10) / 10 })}
              className="w-8 h-9 text-text-muted hover:text-text-primary text-lg transition-colors">+</button>
          </div>
        ) : (
          <button onClick={() => setEditWeight(true)} className="text-left tap-scale">
            <span className={cn('font-mono font-bold', set.done ? 'text-text-muted' : 'text-text-primary')}>
              {set.weight > 0 ? `${set.weight}` : '—'}
            </span>
            <span className="text-[10px] text-text-muted ml-0.5">{unit}</span>
          </button>
        )}
      </div>
      <span className="text-text-muted/40 text-xs">×</span>
      <div className="flex items-center bg-bg-surface rounded-xl border border-border overflow-hidden h-9">
        <button onClick={() => updateSet(exId, set.id, { reps: Math.max(0, set.reps - 1) })}
          className="w-7 h-full text-text-muted hover:text-text-primary text-sm transition-colors">-</button>
        <span className={cn('font-mono font-bold text-sm min-w-[20px] text-center',
          set.done ? 'text-text-muted' : 'text-text-primary'
        )}>{set.reps || '0'}</span>
        <button onClick={() => updateSet(exId, set.id, { reps: set.reps + 1 })}
          className="w-7 h-full text-text-muted hover:text-text-primary text-sm transition-colors">+</button>
      </div>
      <button onClick={() => { toggleSetDone(exId, set.id); set.done ? hapticLight() : hapticSuccess() }}
        className={cn(
          'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border transition-all duration-300',
          set.done ? 'bg-success border-success' : 'bg-success/8 border-success/20'
        )}>
        <Check size={14} className={set.done ? 'text-black' : 'text-success'} />
      </button>
      <button onClick={() => removeSet(exId, set.id)}
        className="text-text-muted/30 hover:text-danger p-0.5 transition-colors duration-200">
        <X size={12} />
      </button>
    </div>
  )
}

function WorkoutExercise({ ex, unit, index, total: totalEx, onSwap }) {
  const { addExtraSet, removeWorkoutExercise, workouts, addWarmupSets, moveWorkoutExercise, updateWorkoutExerciseNotes } = useStore()
  const [collapsed, setCollapsed] = useState(false)
  const [editingNotes, setEditingNotes] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const done = ex.sets.filter(s => s.done).length
  const total = ex.sets.length
  const vol = calcVolume(ex.sets.filter(s => s.done || s.reps > 0))
  const hasWarmup = ex.sets.some(s => s.setType === 'warm_up')

  const lastSession = useMemo(() => {
    const sorted = [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date))
    for (const w of sorted) {
      for (const e of (w.exercises || [])) {
        if (e.exercise === ex.exercise) return e.sets || []
      }
    }
    return []
  }, [workouts, ex.exercise])

  return (
    <Card className="mb-2.5">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm truncate">{ex.exercise}</div>
          <div className="flex gap-2.5 text-[10px] text-text-muted mt-0.5">
            <span className="capitalize">{ex.muscle}</span>
            {vol > 0 && <span className="font-mono text-gold">{(vol / 1000).toFixed(2)}t</span>}
            {ex.notes && <span className="text-accent/70 truncate max-w-[120px]" title={ex.notes}>📝 {ex.notes}</span>}
          </div>
        </div>
        <div className={cn(
          'px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border transition-all duration-500',
          done === total && total > 0 ? 'bg-success/10 border-success/30 text-success' : 'bg-bg-surface border-border text-text-muted'
        )}>{done}/{total}</div>
        <button onClick={() => setCollapsed(x => !x)} className="text-text-muted p-1 hover:text-text-primary transition-colors">
          {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
        <button onClick={() => setShowMenu(v => !v)} className={cn(
          'text-text-muted p-1 transition-colors',
          showMenu ? 'text-accent' : 'hover:text-text-primary'
        )}>
          <Edit2 size={13} />
        </button>
      </div>

      {showMenu && (
        <div className="grid grid-cols-5 gap-1.5 mb-2.5 p-2 bg-bg-elevated/60 rounded-xl border border-border animate-fade-in">
          <button onClick={() => { addWarmupSets(ex.id); setShowMenu(false); hapticLight() }}
            disabled={hasWarmup}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg text-[9px] font-semibold transition-all',
              hasWarmup ? 'opacity-30 cursor-not-allowed bg-bg-surface text-text-muted'
                : 'bg-bg-surface text-orange-400 hover:bg-orange-500/15 border border-border'
            )}>
            <Flame size={13} /> Warmup
          </button>
          <button onClick={() => { onSwap(ex.id); setShowMenu(false); hapticLight() }}
            className="flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg bg-bg-surface border border-border text-[9px] font-semibold text-accent hover:bg-accent/10 transition-all">
            <Repeat size={13} /> Sostituisci
          </button>
          <button onClick={() => { setEditingNotes(true); setShowMenu(false) }}
            className="flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg bg-bg-surface border border-border text-[9px] font-semibold text-gold hover:bg-gold/10 transition-all">
            <StickyNote size={13} /> Note
          </button>
          <button onClick={() => { moveWorkoutExercise(ex.id, -1); hapticLight() }}
            disabled={index === 0}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg text-[9px] font-semibold transition-all',
              index === 0 ? 'opacity-30 cursor-not-allowed bg-bg-surface text-text-muted border border-border'
                : 'bg-bg-surface text-text-secondary hover:bg-accent/10 border border-border'
            )}>
            <ArrowUp size={13} /> Su
          </button>
          <button onClick={() => { moveWorkoutExercise(ex.id, 1); hapticLight() }}
            disabled={index === totalEx - 1}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg text-[9px] font-semibold transition-all',
              index === totalEx - 1 ? 'opacity-30 cursor-not-allowed bg-bg-surface text-text-muted border border-border'
                : 'bg-bg-surface text-text-secondary hover:bg-accent/10 border border-border'
            )}>
            <ArrowDown size={13} /> Giù
          </button>
          <button onClick={() => { removeWorkoutExercise(ex.id); hapticLight() }}
            className="col-span-5 mt-0.5 py-1.5 rounded-lg bg-danger/8 border border-danger/30 text-[10px] font-semibold text-danger hover:bg-danger/15 transition-all flex items-center justify-center gap-1.5">
            <Trash2 size={12} /> Rimuovi esercizio
          </button>
        </div>
      )}

      {editingNotes && (
        <div className="mb-2.5 animate-fade-in">
          <div className="text-[9px] text-gold tracking-widest font-semibold mb-1">NOTE (salvate per i prossimi allenamenti)</div>
          <textarea
            autoFocus
            value={ex.notes || ''}
            onChange={e => updateWorkoutExerciseNotes(ex.id, e.target.value)}
            placeholder="es. presa stretta, fermo 2s, attenzione gomiti..."
            className="w-full bg-bg-surface border border-border rounded-xl px-3 py-2 text-xs text-text-primary placeholder:text-text-muted/60 focus:border-gold/50 resize-none"
            rows={2}
          />
          <button onClick={() => setEditingNotes(false)}
            className="mt-1 text-[10px] text-text-muted hover:text-text-primary">Chiudi</button>
        </div>
      )}

      {!collapsed && (
        <div className="animate-fade-in">
          {lastSession.length > 0 && (
            <div className="flex gap-1.5 mb-2.5 overflow-x-auto pb-1">
              <span className="text-[9px] text-text-muted flex-shrink-0 self-center">Ultimo:</span>
              {lastSession.slice(0, 6).map((s, i) => (
                <span key={i} className="text-[9px] font-mono text-text-muted/50 bg-bg-surface rounded-lg px-1.5 py-0.5 flex-shrink-0">
                  {s.weight}{unit}×{s.reps}
                </span>
              ))}
            </div>
          )}
          <div className="mb-2.5"><RestTimer /></div>
          <div className="flex items-center gap-2 px-1.5 mb-1">
            <div className="w-7" />
            <div className="flex-1 text-[9px] text-text-muted tracking-[0.2em] font-semibold">PESO</div>
            <div className="w-3" />
            <div className="w-[76px] text-center text-[9px] text-text-muted tracking-[0.2em] font-semibold">REPS</div>
            <div className="w-8" />
            <div className="w-5" />
          </div>
          {ex.sets.map(set => (
            <SetRow key={set.id} set={set} exId={ex.id} unit={unit} />
          ))}
          <button onClick={() => addExtraSet(ex.id)}
            className="w-full mt-2.5 py-2 border border-dashed border-border rounded-xl text-xs font-semibold text-text-muted hover:text-accent hover:border-accent/30 transition-all duration-200">
            + Serie extra
          </button>
        </div>
      )}
    </Card>
  )
}

export default function WorkoutPage() {
  const store = useStore()
  const { settings, workouts, currentWorkout, program, dayNames, startWorkout, completeWorkout, discardWorkout, addWorkoutExercise, replaceWorkoutExercise, swapProgramDays } = store
  const unit = settings.unit
  const [showPicker, setShowPicker] = useState(false)
  const [swapTargetId, setSwapTargetId] = useState(null) // ID of exercise being swapped
  const [showFinish, setShowFinish] = useState(false)
  const [showDiscard, setShowDiscard] = useState(false)
  const [showProgramEditor, setShowProgramEditor] = useState(false)
  const [editingDay, setEditingDay] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [swapMode, setSwapMode] = useState(false)
  const [swapFirst, setSwapFirst] = useState(null) // first day index selected for swap
  const t0 = useRef(null)

  const todayIdx = getDayOfWeek()
  const todayProg = program[todayIdx] || []

  useEffect(() => {
    if (!currentWorkout) { t0.current = null; return }
    if (!t0.current) t0.current = currentWorkout.startTime || Date.now()
    const id = setInterval(() => setElapsed(Math.round((Date.now() - t0.current) / 1000)), 1000)
    return () => clearInterval(id)
  }, [currentWorkout])

  // PRE-WORKOUT VIEW
  if (!currentWorkout) {
    const hasProgramForToday = todayProg.length > 0
    const hasAnyProgram = Object.values(program).some(d => d && d.length > 0)

    const lastWeight = (exName) => {
      const sorted = [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date))
      for (const w of sorted) for (const ex of (w.exercises || [])) if (ex.exercise === exName) {
        const s = ex.sets?.find(s => s.weight > 0); if (s) return s.weight
      }
      return 0
    }

    return (
      <div className="px-4 pt-5 pb-4 animate-fade-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold tracking-wide">Workout</h2>
          <div className="flex gap-1.5">
            <Button size="sm" variant={swapMode ? 'primary' : 'ghost'}
              onClick={() => { setSwapMode(v => !v); setSwapFirst(null); hapticLight() }}>
              <ArrowLeftRight size={14} /> {swapMode ? 'Scambia...' : 'Scambia'}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowProgramEditor(true)}>
              <Edit2 size={14} /> Programma
            </Button>
          </div>
        </div>

        {/* Swap mode banner */}
        {swapMode && (
          <div className="mb-3 px-3 py-2.5 bg-accent/10 border border-accent/30 rounded-xl animate-fade-in">
            <div className="text-xs text-accent font-semibold text-center">
              {swapFirst === null
                ? '👆 Tocca il PRIMO giorno da scambiare'
                : `✅ ${DAYS[swapFirst]} selezionato — ora tocca il SECONDO giorno`}
            </div>
            {swapFirst !== null && (
              <button onClick={() => setSwapFirst(null)}
                className="block mx-auto mt-1 text-[10px] text-text-muted hover:text-text-primary">
                Annulla selezione
              </button>
            )}
          </div>
        )}

        {/* Day pills */}
        <div className="flex gap-1.5 mb-5">
          {DAYS_SHORT.map((d, i) => {
            const hasEx = (program[i] || []).length > 0
            const isToday = i === todayIdx
            const isSwapSelected = swapMode && swapFirst === i
            const dayName = dayNames[i]

            const handleDayClick = () => {
              if (swapMode) {
                if (swapFirst === null) {
                  setSwapFirst(i)
                  hapticLight()
                } else if (swapFirst === i) {
                  setSwapFirst(null) // deselect
                } else {
                  swapProgramDays(swapFirst, i)
                  hapticSuccess()
                  setSwapFirst(null)
                  setSwapMode(false)
                }
              } else {
                if (hasEx) startWorkout(i)
              }
            }

            return (
              <button key={i} onClick={handleDayClick}
                className={cn(
                  'flex-1 py-2.5 rounded-xl text-center border transition-all duration-300',
                  isSwapSelected ? 'bg-accent/20 border-accent ring-2 ring-accent/40 text-accent font-bold scale-105' :
                  swapMode ? 'bg-bg-surface border-border text-text-primary hover:border-accent/40 hover:bg-accent/[0.06]' :
                  isToday && hasEx ? 'bg-accent/10 border-accent/40 text-accent font-bold' :
                  isToday ? 'border-accent/25 text-accent' :
                  hasEx ? 'bg-bg-surface border-border text-text-primary hover:border-accent/25 hover:bg-accent/[0.04]' :
                  'border-border text-text-muted/30'
                )}>
                <div className="text-[10px] font-semibold">{d}</div>
                {dayName && <div className="text-[7px] text-text-muted truncate px-0.5 leading-tight mt-0.5">{dayName}</div>}
                {hasEx && <div className="w-1.5 h-1.5 rounded-full bg-accent mx-auto mt-1" />}
                {!hasEx && !dayName && <div className="text-[8px] text-text-muted/40 mt-0.5">Rest</div>}
              </button>
            )
          })}
        </div>

        <div className="stagger-up">
          {/* Today's program */}
          {hasProgramForToday ? (
            <>
              <Card className="mb-4 border-accent/15 bg-gradient-to-br from-bg-card to-accent/[0.03]">
                <CardTitle>{dayNames[todayIdx] ? `${dayNames[todayIdx].toUpperCase()} — ` : ''}{DAYS[todayIdx].toUpperCase()}</CardTitle>
                {todayProg.map((ex, i) => {
                  const lw = lastWeight(ex.exercise)
                  const numSets = ex.setDefs?.length || ex.sets || 0
                  const repSummary = ex.setDefs
                    ? [...new Set(ex.setDefs.map(s => s.repRange))].join(', ')
                    : ex.repRange
                  return (
                    <div key={ex.id} className={`flex items-center justify-between py-3 ${i < todayProg.length - 1 ? 'border-b border-border/40' : ''}`}>
                      <div>
                        <div className="text-sm font-bold">{ex.exercise}</div>
                        <div className="text-[11px] text-text-muted mt-0.5">{numSets} serie · {repSummary} reps</div>
                      </div>
                      <div className="text-right">
                        {lw > 0 && <div className="text-sm font-mono font-bold text-gold">{lw}{unit}</div>}
                        <div className="text-[10px] text-text-muted">{lw > 0 ? 'ultimo peso' : 'prima volta'}</div>
                      </div>
                    </div>
                  )
                })}
              </Card>
              <Button onClick={() => startWorkout(todayIdx)} className="w-full mb-3" size="xl">
                INIZIA ALLENAMENTO
              </Button>
            </>
          ) : (
            <Card className="mb-4 text-center py-10">
              <div className="text-text-muted mb-4">
                {hasAnyProgram
                  ? `Nessun esercizio programmato per ${DAYS[todayIdx].toLowerCase()}.`
                  : 'Non hai ancora creato il tuo programma.'}
              </div>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => setShowProgramEditor(true)} variant="secondary">
                  <Edit2 size={14} /> {hasAnyProgram ? 'Modifica programma' : 'Crea programma'}
                </Button>
                <Button onClick={() => startWorkout('free')}>
                  Allenamento libero
                </Button>
              </div>
            </Card>
          )}

          {hasProgramForToday && (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => startWorkout('free')} className="flex-1" size="sm">
                Allenamento libero
              </Button>
            </div>
          )}

          {hasAnyProgram && (
            <div className="mt-6">
              <CardTitle>ALTRI GIORNI</CardTitle>
              <div className="space-y-2">
                {DAYS.map((day, i) => {
                  const dayProg = program[i] || []
                  if (!dayProg.length || i === todayIdx) return null
                  const totalSets = dayProg.reduce((a, e) => a + (e.setDefs?.length || e.sets || 0), 0)
                  return (
                    <Card key={i} hover onClick={() => startWorkout(i)} className="!p-3.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold">{dayNames[i] ? `${dayNames[i]} — ` : ''}{day}</div>
                          <div className="text-[10px] text-text-muted mt-0.5">
                            {dayProg.length} esercizi · {totalSets} serie
                          </div>
                        </div>
                        <div className="text-xs text-accent font-semibold">Inizia →</div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <ProgramEditorSheet
          open={showProgramEditor}
          onClose={() => setShowProgramEditor(false)}
        />
      </div>
    )
  }

  // ACTIVE WORKOUT
  const doneCount = currentWorkout.exercises.reduce((a, e) => a + e.sets.filter(s => s.done).length, 0)
  const totalCount = currentWorkout.exercises.reduce((a, e) => a + e.sets.length, 0)
  const totalVol = currentWorkout.exercises.reduce((a, e) => a + calcVolume(e.sets.filter(s => s.done || s.reps > 0)), 0)
  const pct = totalCount > 0 ? Math.round(doneCount / totalCount * 100) : 0
  const dayLabel = currentWorkout.splitDay || (currentWorkout.dayIndex !== 'free' ? DAYS[currentWorkout.dayIndex] : 'Allenamento Libero')

  return (
    <div className="px-4 pt-3 pb-4 animate-fade-in">
      <div className="bg-bg-card border border-accent/20 rounded-2xl p-4 mb-4 shadow-[0_0_24px_rgba(204,204,204,0.08)]">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1">
            <div className="text-lg font-bold text-accent">{dayLabel}</div>
            <div className="flex gap-3 text-[11px] text-text-muted mt-1">
              <span className="flex items-center gap-1"><Clock size={10} /> {formatTime(elapsed)}</span>
              <span>{doneCount}/{totalCount} serie</span>
              {totalVol > 0 && <span className="font-mono text-gold">{(totalVol / 1000).toFixed(2)}t</span>}
            </div>
          </div>
          <Button size="sm" variant="ghost"
            onClick={() => {
              hapticLight()
              // iOS-reliable native confirm fallback in case modal animation hangs
              if (window.confirm('Annullare allenamento? I dati saranno persi.')) {
                hapticMedium()
                discardWorkout()
              }
            }}>Annulla</Button>
          <Button size="sm" variant="gold" onClick={() => { hapticLight(); setShowFinish(true) }}>Fine</Button>
        </div>
        <div className="h-1.5 bg-bg-surface rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-accent to-success rounded-full transition-all duration-700 ease-out"
            style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="stagger-up">
        {currentWorkout.exercises.map((ex, i) => (
          <WorkoutExercise
            key={ex.id} ex={ex} unit={unit}
            index={i} total={currentWorkout.exercises.length}
            onSwap={(exId) => setSwapTargetId(exId)}
          />
        ))}
      </div>

      <button onClick={() => setShowPicker(true)}
        className="w-full py-3.5 border-2 border-dashed border-accent/20 rounded-2xl text-accent font-semibold text-sm flex items-center justify-center gap-2 hover:border-accent/40 hover:bg-accent/[0.03] transition-all duration-300">
        <Plus size={16} /> AGGIUNGI ESERCIZIO
      </button>

      <ExercisePicker open={showPicker} onClose={() => setShowPicker(false)}
        onAdd={(exercise, sets, rr) => addWorkoutExercise(exercise, sets, rr)} />

      <ExercisePicker
        open={!!swapTargetId}
        onClose={() => setSwapTargetId(null)}
        onAdd={(exercise) => { replaceWorkoutExercise(swapTargetId, exercise); setSwapTargetId(null) }}
      />

      <Modal open={showDiscard} onClose={() => setShowDiscard(false)}>
        <h3 className="text-xl font-bold mb-2 text-center">Annullare?</h3>
        <p className="text-sm text-text-muted text-center mb-6">I dati dell'allenamento saranno persi.</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => { hapticLight(); setShowDiscard(false) }} className="flex-1">Continua</Button>
          <Button variant="danger" onClick={() => { hapticMedium(); discardWorkout(); setShowDiscard(false) }} className="flex-1">Annulla</Button>
        </div>
      </Modal>

      <Modal open={showFinish} onClose={() => setShowFinish(false)}>
        <div className="text-center">
          <div className="animate-scale-spring">
            <Trophy size={44} className="text-gold mx-auto mb-4" />
          </div>
          <h3 className="text-2xl font-bold mb-5">Salva allenamento?</h3>
          <div className="flex justify-center gap-6 mb-6">
            <div className="animate-count-up">
              <div className="text-xl font-mono font-bold text-accent">{formatTime(elapsed)}</div>
              <div className="text-[10px] text-text-muted mt-1">durata</div>
            </div>
            <div className="animate-count-up" style={{ animationDelay: '100ms' }}>
              <div className="text-xl font-mono font-bold text-gold">{doneCount}</div>
              <div className="text-[10px] text-text-muted mt-1">serie</div>
            </div>
            <div className="animate-count-up" style={{ animationDelay: '200ms' }}>
              <div className="text-xl font-mono font-bold text-success">{(totalVol / 1000).toFixed(1)}t</div>
              <div className="text-[10px] text-text-muted mt-1">volume</div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowFinish(false)} className="flex-1">Indietro</Button>
            <Button variant="gold" onClick={() => { completeWorkout(); setShowFinish(false) }} className="flex-1">Salva</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function ProgramEditorSheet({ open, onClose }) {
  const { program, dayNames, updateProgramDay, setDayName, swapProgramDays } = useStore()
  const [activeDay, setActiveDay] = useState(getDayOfWeek())
  const [showPicker, setShowPicker] = useState(false)
  const [editName, setEditName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [editorSwapMode, setEditorSwapMode] = useState(false)
  const [editorSwapFirst, setEditorSwapFirst] = useState(null)

  if (!open) return null

  const dayProg = program[activeDay] || []
  const currentDayName = dayNames[activeDay] || ''

  const removeEx = (id) => {
    updateProgramDay(activeDay, dayProg.filter(e => e.id !== id))
  }

  const addEx = (exercise, sets, repRange) => {
    const setDefs = Array.from({ length: sets }, (_, i) => ({
      setType: i === 0 ? 'top_set' : 'normal',
      repRange,
    }))
    updateProgramDay(activeDay, [...dayProg, {
      id: Math.random().toString(36).slice(2, 9),
      exercise,
      setDefs,
    }])
  }

  const updateSetDef = (exId, setIdx, updates) => {
    updateProgramDay(activeDay, dayProg.map(e => {
      if (e.id !== exId) return e
      const setDefs = [...(e.setDefs || [])]
      setDefs[setIdx] = { ...setDefs[setIdx], ...updates }
      return { ...e, setDefs }
    }))
  }

  const addSetDef = (exId) => {
    updateProgramDay(activeDay, dayProg.map(e => {
      if (e.id !== exId) return e
      const setDefs = [...(e.setDefs || [])]
      const last = setDefs[setDefs.length - 1] || { setType: 'normal', repRange: '8-10' }
      return { ...e, setDefs: [...setDefs, { setType: last.setType === 'top_set' ? 'back_off' : 'normal', repRange: last.repRange }] }
    }))
  }

  const removeSetDef = (exId, setIdx) => {
    updateProgramDay(activeDay, dayProg.map(e => {
      if (e.id !== exId) return e
      const setDefs = (e.setDefs || []).filter((_, i) => i !== setIdx)
      return { ...e, setDefs }
    }))
  }

  const handleSaveName = () => {
    setDayName(activeDay, nameInput.trim())
    setEditName(false)
  }

  const setTypes = SET_TYPES

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-bg animate-fade-in">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
        <h3 className="text-lg font-bold">Il tuo Programma</h3>
        <div className="flex gap-1.5">
          <Button size="sm" variant={editorSwapMode ? 'primary' : 'ghost'}
            onClick={() => { setEditorSwapMode(v => !v); setEditorSwapFirst(null); hapticLight() }}>
            <ArrowLeftRight size={13} /> Scambia
          </Button>
          <Button size="sm" variant="ghost" onClick={onClose}>Chiudi</Button>
        </div>
      </div>

      {editorSwapMode && (
        <div className="mx-4 mt-3 px-3 py-2 bg-accent/10 border border-accent/30 rounded-xl animate-fade-in">
          <div className="text-xs text-accent font-semibold text-center">
            {editorSwapFirst === null
              ? '👆 Tocca il PRIMO giorno da scambiare'
              : `✅ ${DAYS[editorSwapFirst]} — ora tocca il SECONDO`}
          </div>
        </div>
      )}

      <div className="flex gap-1 px-4 py-3 border-b border-border overflow-x-auto">
        {DAYS_SHORT.map((d, i) => {
          const hasEx = (program[i] || []).length > 0
          const name = dayNames[i]
          const isSwapSel = editorSwapMode && editorSwapFirst === i

          const handleEditorDayClick = () => {
            if (editorSwapMode) {
              if (editorSwapFirst === null) {
                setEditorSwapFirst(i)
                hapticLight()
              } else if (editorSwapFirst === i) {
                setEditorSwapFirst(null)
              } else {
                swapProgramDays(editorSwapFirst, i)
                hapticSuccess()
                setEditorSwapFirst(null)
                setEditorSwapMode(false)
                setActiveDay(i)
              }
            } else {
              setActiveDay(i)
            }
          }

          return (
            <button key={i} onClick={handleEditorDayClick}
              className={cn(
                'flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-300 relative',
                isSwapSel ? 'bg-accent/20 border-accent ring-2 ring-accent/40 text-accent scale-105' :
                editorSwapMode ? 'bg-bg-surface border-border text-text-muted hover:border-accent/40' :
                activeDay === i ? 'bg-accent/10 border-accent/40 text-accent' :
                'bg-bg-surface border-border text-text-muted hover:border-border-strong'
              )}>
              <div>{d}</div>
              {name && <div className="text-[8px] opacity-70 mt-0.5 truncate max-w-[50px]">{name}</div>}
              {hasEx && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-accent" />}
            </button>
          )
        })}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex items-center gap-2 mb-4">
          {editName ? (
            <div className="flex gap-2 flex-1 animate-scale-in">
              <input value={nameInput} onChange={e => setNameInput(e.target.value)}
                placeholder="es. Push, Upper, Petto..."
                autoFocus onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                className="flex-1 bg-bg-surface border border-accent/40 rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-muted" />
              <Button size="sm" onClick={handleSaveName}>OK</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditName(false)}>×</Button>
            </div>
          ) : (
            <>
              <h4 className="text-sm font-bold text-text-secondary">
                {currentDayName ? `${currentDayName} — ` : ''}{DAYS[activeDay]}
              </h4>
              <button onClick={() => { setNameInput(currentDayName); setEditName(true) }}
                className="text-text-muted hover:text-accent transition-colors duration-200">
                <Edit2 size={13} />
              </button>
              <span className="ml-auto text-[10px] text-text-muted">{dayProg.length} esercizi</span>
            </>
          )}
        </div>

        {dayProg.length === 0 && (
          <div className="text-center py-10 text-text-muted text-sm animate-fade-in">
            Nessun esercizio per questo giorno.<br />
            Aggiungi esercizi per creare la tua scheda.
          </div>
        )}

        <div className="stagger-up">
          {dayProg.map(ex => {
            const defs = ex.setDefs || []
            return (
              <Card key={ex.id} className="mb-2.5 !p-3.5">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="flex-1 font-bold text-sm">{ex.exercise}</div>
                  <span className="text-[10px] text-text-muted font-mono">{defs.length} serie</span>
                  <button onClick={() => removeEx(ex.id)} className="text-text-muted hover:text-danger p-1 transition-colors duration-200">
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="space-y-1.5">
                  {defs.map((def, si) => {
                    const st = setTypes.find(t => t.id === def.setType) || setTypes[0]
                    return (
                      <div key={si} className="flex items-center gap-1.5 bg-bg-surface rounded-xl px-2.5 py-2 border border-border">
                        <span className="text-[10px] font-mono font-bold text-text-muted w-4 text-center">{si + 1}</span>
                        <select value={def.setType}
                          onChange={e => updateSetDef(ex.id, si, { setType: e.target.value })}
                          className="bg-bg-elevated border border-border rounded-lg px-2 py-1 text-[10px] font-semibold text-text-primary"
                          style={{ color: st.color, minWidth: 80 }}>
                          {setTypes.map(t => (
                            <option key={t.id} value={t.id}>{t.label}</option>
                          ))}
                        </select>
                        <div className="flex gap-0.5 flex-1 justify-end">
                          {['4-6', '6-8', '8-10', '10-12', '12-15', '15-20'].map(r => (
                            <button key={r} onClick={() => updateSetDef(ex.id, si, { repRange: r })}
                              className={cn('px-1.5 py-0.5 rounded-lg text-[9px] font-semibold transition-all duration-200',
                                def.repRange === r ? 'bg-accent/15 text-accent' : 'text-text-muted hover:text-text-primary'
                              )}>{r}</button>
                          ))}
                        </div>
                        {defs.length > 1 && (
                          <button onClick={() => removeSetDef(ex.id, si)}
                            className="text-text-muted/30 hover:text-danger p-0.5 transition-colors duration-200">
                            <X size={11} />
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>

                <button onClick={() => addSetDef(ex.id)}
                  className="w-full mt-2 py-1.5 text-[10px] font-semibold text-text-muted hover:text-accent border border-dashed border-border rounded-xl transition-all duration-200">
                  + Aggiungi serie
                </button>
              </Card>
            )
          })}
        </div>

        <button onClick={() => setShowPicker(true)}
          className="w-full py-3.5 border-2 border-dashed border-accent/20 rounded-2xl text-accent font-semibold text-sm flex items-center justify-center gap-2 hover:border-accent/40 hover:bg-accent/[0.03] transition-all duration-300 mt-2">
          <Plus size={16} /> Aggiungi Esercizio
        </button>
      </div>

      <ExercisePicker open={showPicker} onClose={() => setShowPicker(false)} onAdd={addEx} />
    </div>
  )
}
