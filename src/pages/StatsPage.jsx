import { useState, useMemo } from 'react'
import { useStore } from '@/store/useStore'
import { MUSCLE_GROUPS, MUSCLE_LABELS, EX_TO_MUSCLE } from '@/lib/exerciseDB'
import { calcVolume, epley, formatDate } from '@/lib/utils'
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts'
import { BarChart2, ChevronDown, ArrowUp, ArrowDown, Minus, Trophy, TrendingUp, Scale } from 'lucide-react'
import Card, { CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg-elevated/95 backdrop-blur-md border border-border rounded-xl px-3.5 py-2.5 text-xs shadow-xl">
      <div className="text-text-muted mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }} className="font-mono font-bold">
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  )
}

export default function StatsPage() {
  const { workouts, settings, bodyWeightLog, prs } = useStore()
  const unit = settings.unit
  const [sel, setSel] = useState('')
  const [showSel, setShowSel] = useState(false)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('exercise')

  const loggedEx = useMemo(() => {
    const s = new Set()
    workouts.forEach(w => w.exercises?.forEach(e => s.add(e.exercise)))
    return [...s].sort()
  }, [workouts])

  useState(() => { if (loggedEx.length && !sel) setSel(loggedEx[0]) })

  const exData = useMemo(() => {
    if (!sel) return []
    const rows = []
    const sorted = [...workouts].sort((a, b) => new Date(a.date) - new Date(b.date))
    for (const w of sorted) {
      for (const ex of (w.exercises || [])) {
        if (ex.exercise === sel) {
          const sets = ex.sets?.filter(s => s.weight > 0 && s.reps > 0) || []
          if (!sets.length) continue
          const topSet = [...sets].sort((a, b) => b.weight - a.weight)[0]
          rows.push({
            date: formatDate(w.date), weight: topSet.weight, reps: topSet.reps,
            rm: epley(topSet.weight, topSet.reps), vol: Math.round(calcVolume(sets))
          })
        }
      }
    }
    return rows
  }, [sel, workouts])

  const radarData = useMemo(() => {
    const now = new Date()
    const start = new Date(now); start.setDate(start.getDate() - ((now.getDay() + 6) % 7)); start.setHours(0, 0, 0, 0)
    const vol = {}
    for (const w of workouts) {
      if (new Date(w.date) >= start)
        for (const ex of (w.exercises || [])) {
          const m = EX_TO_MUSCLE[ex.exercise] || 'other'
          vol[m] = (vol[m] || 0) + calcVolume(ex.sets)
        }
    }
    return MUSCLE_GROUPS.map(m => ({
      m: MUSCLE_LABELS[m]?.slice(0, 4) || m.slice(0, 4),
      v: Math.round((vol[m] || 0) / 100) / 10
    }))
  }, [workouts])

  const totalVol = workouts.reduce((a, w) => a + (w.totalVolume || 0), 0)

  const monthlyData = useMemo(() => {
    const months = {}
    workouts.forEach(w => {
      const key = new Date(w.date).toLocaleDateString('it-IT', { month: 'short', year: '2-digit' })
      if (!months[key]) months[key] = { sessions: 0, volume: 0 }
      months[key].sessions++
      months[key].volume += (w.totalVolume || 0)
    })
    return Object.entries(months).map(([month, data]) => ({
      month, sessions: data.sessions, volume: Math.round(data.volume / 1000)
    }))
  }, [workouts])

  const bwData = useMemo(() => {
    return [...bodyWeightLog]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(e => ({ date: formatDate(e.date), weight: e.weight }))
  }, [bodyWeightLog])

  return (
    <div className="px-4 pt-5 pb-4">
      <h2 className="text-2xl font-bold tracking-wide mb-5 animate-fade-in">STATISTICHE</h2>

      {/* Global stats */}
      <div className="grid grid-cols-3 gap-2 mb-5 animate-fade-in">
        {[
          { l: 'SESSIONI', v: workouts.length, c: 'text-accent' },
          { l: 'VOLUME TOT', v: `${(totalVol / 1000).toFixed(0)}t`, c: 'text-gold' },
          { l: 'ESERCIZI', v: loggedEx.length, c: 'text-success' },
        ].map((s, i) => (
          <Card key={s.l} className="text-center !p-3">
            <div className={`text-xl font-black font-mono ${s.c} animate-count-up`} style={{ animationDelay: `${i * 80}ms` }}>{s.v}</div>
            <CardTitle className="!mb-0 mt-1">{s.l}</CardTitle>
          </Card>
        ))}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 mb-5 bg-bg-surface/80 rounded-2xl p-1 border border-border animate-fade-in">
        {[
          { id: 'exercise', label: 'Esercizio', icon: TrendingUp },
          { id: 'body', label: 'Peso', icon: Scale },
          { id: 'records', label: 'Records', icon: Trophy },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 ${
              tab === t.id ? 'bg-accent/12 text-accent shadow-sm' : 'text-text-muted hover:text-text-secondary'
            }`}>
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {workouts.length === 0 && (
        <Card className="text-center py-14 animate-fade-in">
          <div className="animate-float">
            <BarChart2 size={40} className="text-text-muted/20 mx-auto mb-4" />
          </div>
          <div className="text-text-muted">Completa il tuo primo allenamento per vedere le statistiche.</div>
        </Card>
      )}

      {workouts.length > 0 && tab === 'exercise' && (
        <div className="stagger-up">
          <Card className="mb-3">
            <CardTitle>VOLUME MUSCOLARE SETTIMANALE</CardTitle>
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={radarData} margin={{ top: 4, right: 20, left: 20, bottom: 4 }}>
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis dataKey="m" tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} />
                <PolarRadiusAxis tick={false} axisLine={false} />
                <Radar dataKey="v" stroke="var(--color-accent)" fill="var(--color-accent)" fillOpacity={0.12} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="mb-3">
            <CardTitle>PROGRESSIONE ESERCIZIO</CardTitle>
            <button onClick={() => setShowSel(x => !x)}
              className="w-full bg-bg-surface border border-border rounded-xl px-3.5 py-2.5 text-left flex justify-between items-center text-sm font-semibold transition-all duration-200 hover:border-border-strong">
              {sel || 'Seleziona esercizio'} <ChevronDown size={14} className={`text-text-muted transition-transform duration-300 ${showSel ? 'rotate-180' : ''}`} />
            </button>
            {showSel && (
              <div className="mt-2 animate-fade-in">
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca..."
                  className="w-full bg-bg-surface border border-border rounded-xl px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted mb-2" />
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {loggedEx.filter(e => e.toLowerCase().includes(search.toLowerCase())).map(e => (
                    <button key={e} onClick={() => { setSel(e); setShowSel(false); setSearch('') }}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm border transition-all duration-200 ${
                        e === sel ? 'bg-accent/8 border-accent/30 text-accent' : 'bg-bg-surface border-border text-text-primary hover:border-border-strong'
                      }`}>{e}</button>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {sel && exData.length > 0 && (
            <Card>
              <CardTitle>PESO TOP SET</CardTitle>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={exData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" tick={{ fill: 'var(--color-text-muted)', fontSize: 9 }} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 9 }} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="weight" stroke="var(--color-accent)" strokeWidth={2} dot={{ fill: 'var(--color-accent)', r: 3 }} name="Peso" />
                </LineChart>
              </ResponsiveContainer>

              <CardTitle className="mt-5">1RM STIMATO (Epley)</CardTitle>
              <ResponsiveContainer width="100%" height={110}>
                <LineChart data={exData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" tick={{ fill: 'var(--color-text-muted)', fontSize: 9 }} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 9 }} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="rm" stroke="var(--color-gold)" strokeWidth={2} dot={{ fill: 'var(--color-gold)', r: 3 }} name="e1RM" />
                </LineChart>
              </ResponsiveContainer>

              <CardTitle className="mt-5">ULTIME 5 SESSIONI</CardTitle>
              <div className="rounded-xl overflow-hidden border border-border">
                <div className="grid grid-cols-4 bg-bg-surface px-3.5 py-2">
                  {['DATA', 'PESO', 'REPS', 'e1RM'].map(h => (
                    <span key={h} className="text-[9px] text-text-muted tracking-[0.2em] font-semibold">{h}</span>
                  ))}
                </div>
                {exData.slice(-5).reverse().map((s, i) => {
                  const prev = exData.slice(-5).reverse()[i + 1]
                  const dir = prev ? (s.rm > prev.rm ? 'up' : s.rm < prev.rm ? 'down' : 'eq') : 'eq'
                  return (
                    <div key={i} className={`grid grid-cols-4 px-3.5 py-2.5 border-t border-border/50 ${i % 2 === 0 ? '' : 'bg-bg-surface/30'}`}>
                      <span className="text-[11px] text-text-muted">{s.date}</span>
                      <span className="text-xs font-mono">{s.weight}{unit}</span>
                      <span className="text-xs font-mono">{s.reps}</span>
                      <span className={`flex items-center gap-1 text-xs font-mono ${
                        dir === 'up' ? 'text-success' : dir === 'down' ? 'text-danger' : 'text-text-muted'
                      }`}>
                        {dir === 'up' ? <ArrowUp size={10} /> : dir === 'down' ? <ArrowDown size={10} /> : <Minus size={10} />}
                        {s.rm}{unit}
                      </span>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}

          {monthlyData.length > 0 && (
            <Card className="mt-3">
              <CardTitle>SESSIONI MENSILI</CardTitle>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" tick={{ fill: 'var(--color-text-muted)', fontSize: 9 }} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 9 }} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="sessions" fill="var(--color-accent)" radius={[6, 6, 0, 0]} name="Sessioni" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>
      )}

      {tab === 'body' && (
        <div className="animate-fade-in">
          {bwData.length > 0 ? (
            <Card>
              <CardTitle>ANDAMENTO PESO CORPOREO</CardTitle>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={bwData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" tick={{ fill: 'var(--color-text-muted)', fontSize: 9 }} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 9 }} tickLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="weight" stroke="var(--color-teal)" strokeWidth={2} dot={{ fill: 'var(--color-teal)', r: 3 }} name={`Peso (${unit})`} />
                </LineChart>
              </ResponsiveContainer>

              {bodyWeightLog.length >= 7 && (
                <div className="grid grid-cols-3 gap-2 mt-5">
                  {(() => {
                    const sorted = [...bodyWeightLog].sort((a, b) => new Date(b.date) - new Date(a.date))
                    const last7 = sorted.slice(0, 7).map(e => e.weight)
                    const last30 = sorted.slice(0, 30).map(e => e.weight)
                    const avg7 = last7.reduce((a, v) => a + v, 0) / last7.length
                    const avg30 = last30.reduce((a, v) => a + v, 0) / last30.length
                    const first = sorted[sorted.length - 1]?.weight || 0
                    const last = sorted[0]?.weight || 0
                    const pctChange = first > 0 ? (((last - first) / first) * 100).toFixed(1) : '0'
                    return [
                      { l: 'MEDIA 7G', v: avg7.toFixed(1) },
                      { l: 'MEDIA 30G', v: avg30.toFixed(1) },
                      { l: 'VARIAZIONE', v: `${pctChange}%` },
                    ].map((s, i) => (
                      <div key={s.l} className="bg-bg-surface rounded-xl p-3 text-center border border-border">
                        <div className="text-sm font-mono font-bold text-teal animate-count-up" style={{ animationDelay: `${i * 80}ms` }}>{s.v}</div>
                        <div className="text-[9px] text-text-muted tracking-[0.15em] font-semibold mt-1">{s.l}</div>
                      </div>
                    ))
                  })()}
                </div>
              )}
            </Card>
          ) : (
            <Card className="text-center py-12">
              <div className="animate-float">
                <Scale size={40} className="text-text-muted/20 mx-auto mb-4" />
              </div>
              <div className="text-text-muted text-sm">Registra il tuo peso nelle impostazioni per vedere il grafico.</div>
            </Card>
          )}
        </div>
      )}

      {tab === 'records' && (
        <div className="animate-fade-in">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={16} className="text-gold" />
              <CardTitle className="!mb-0">TUTTI I PERSONAL RECORDS</CardTitle>
            </div>
            {prs.length === 0 && (
              <div className="text-center py-10 text-text-muted text-sm">Nessun PR ancora. Continua ad allenarti!</div>
            )}
            {prs.map((pr, i) => (
              <div key={pr.id} className="flex justify-between items-center py-3 border-b border-border/40 last:border-0"
                style={{ animationDelay: `${i * 40}ms` }}>
                <div>
                  <div className="text-sm font-bold">{pr.exercise}</div>
                  <div className="text-[10px] text-text-muted">{formatDate(pr.date)}</div>
                </div>
                <div className="text-right">
                  <div className="shimmer font-mono font-bold">{pr.weight}{unit}×{pr.reps}</div>
                  <div className="text-[10px] text-gold/80">e1RM {pr.rm}{unit}</div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  )
}
