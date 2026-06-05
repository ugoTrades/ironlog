import { useState, useMemo } from 'react'
import { useStore } from '@/store/useStore'
import { REP_RANGES } from '@/lib/constants'
import { EXERCISE_DB, MUSCLE_GROUPS, MUSCLE_LABELS } from '@/lib/exerciseDB'
import { Star, StarOff, Plus, Check } from 'lucide-react'
import BottomSheet from '@/components/ui/BottomSheet'
import Button from '@/components/ui/Button'

export default function ExercisePicker({ open, onClose, onAdd }) {
  const { customExercises, favoriteExercises, toggleFavorite, addCustomExercise } = useStore()
  const [search, setSearch] = useState('')
  const [muscle, setMuscle] = useState('all')
  const [sets, setSets] = useState(3)
  const [rr, setRr] = useState('8-10')
  const [picked, setPicked] = useState('')
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newMuscle, setNewMuscle] = useState('chest')

  const allEx = useMemo(() => {
    const db = {}
    Object.entries(EXERCISE_DB).forEach(([m, exs]) => exs.forEach(e => { db[e] = m }))
    customExercises.forEach(e => { db[e.name] = e.muscle })
    return Object.entries(db).map(([name, muscle]) => ({ name, muscle }))
  }, [customExercises])

  const filtered = allEx.filter(e =>
    (muscle === 'all' || e.muscle === muscle) &&
    (!search || e.name.toLowerCase().includes(search.toLowerCase()))
  )

  const favs = filtered.filter(e => favoriteExercises.includes(e.name))
  const rest = filtered.filter(e => !favoriteExercises.includes(e.name))

  const grouped = {}
  rest.forEach(e => { if (!grouped[e.muscle]) grouped[e.muscle] = []; grouped[e.muscle].push(e) })

  const handleCreate = () => {
    const name = newName.trim()
    if (!name) return
    // Prevent duplicates
    if (allEx.some(e => e.name.toLowerCase() === name.toLowerCase())) {
      setPicked(name)
      setCreating(false)
      setNewName('')
      return
    }
    addCustomExercise(name, newMuscle)
    setPicked(name)
    setCreating(false)
    setNewName('')
  }

  // Show "create" hint when search has no match
  const showCreateHint = search.trim().length > 1 && filtered.length === 0 && !creating

  return (
    <BottomSheet open={open} onClose={onClose} title="Aggiungi Esercizio">
      <div className="flex gap-2 mb-3">
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Cerca esercizio..."
          className="flex-1 bg-bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 transition-colors"
        />
        <button
          onClick={() => { setCreating(true); setNewName(search) }}
          className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center hover:bg-accent/25 transition-all active:scale-95"
          title="Crea nuovo esercizio"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Create new exercise form */}
      {creating && (
        <div className="bg-accent/[0.04] border border-accent/30 rounded-xl p-3 mb-3 animate-scale-in">
          <div className="text-[10px] text-accent tracking-widest font-semibold mb-2">CREA NUOVO ESERCIZIO</div>
          <input
            autoFocus
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Nome esercizio"
            className="w-full bg-bg-surface border border-border rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 mb-2"
          />
          <div className="text-[10px] text-text-muted tracking-widest font-semibold mb-1.5">GRUPPO MUSCOLARE</div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {MUSCLE_GROUPS.map(m => (
              <button key={m} onClick={() => setNewMuscle(m)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                  newMuscle === m ? 'bg-accent/15 border-accent text-accent' : 'bg-bg-elevated border-border text-text-muted'
                }`}>
                {MUSCLE_LABELS[m] || m}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setCreating(false); setNewName('') }}
              className="flex-1 px-3 py-2 rounded-xl text-xs font-bold bg-bg-elevated border border-border text-text-muted">
              Annulla
            </button>
            <button onClick={handleCreate} disabled={!newName.trim()}
              className="flex-1 px-3 py-2 rounded-xl text-xs font-bold bg-accent text-bg disabled:opacity-40 transition-all">
              <Check size={12} className="inline mr-1" /> Crea
            </button>
          </div>
        </div>
      )}

      {showCreateHint && (
        <button
          onClick={() => { setCreating(true); setNewName(search) }}
          className="w-full mb-3 px-3 py-3 rounded-xl border-2 border-dashed border-accent/40 bg-accent/[0.04] text-accent text-sm font-semibold flex items-center justify-center gap-2 hover:bg-accent/10 transition-all"
        >
          <Plus size={14} /> Crea "{search}"
        </button>
      )}

      {/* Muscle filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-3 -mx-1 px-1">
        {['all', ...MUSCLE_GROUPS].map(m => (
          <button key={m} onClick={() => setMuscle(m)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${
              muscle === m
                ? 'bg-accent/15 border-accent text-accent'
                : 'bg-bg-surface border-border text-text-muted'
            }`}>
            {m === 'all' ? 'Tutti' : MUSCLE_LABELS[m] || m}
          </button>
        ))}
      </div>

      {/* Selected exercise config */}
      {picked && (
        <div className="bg-bg-surface rounded-xl p-3 mb-3 border border-accent/30 animate-scale-in">
          <div className="text-sm font-bold text-accent mb-3">{picked}</div>
          <div className="mb-3">
            <div className="text-[10px] text-text-muted tracking-widest font-semibold mb-1.5">SERIE</div>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <button key={n} onClick={() => setSets(n)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold border transition-all ${
                    sets === n ? 'bg-gold/15 border-gold text-gold' : 'bg-bg-elevated border-border text-text-muted'
                  }`}>{n}</button>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <div className="text-[10px] text-text-muted tracking-widest font-semibold mb-1.5">RANGE REPS</div>
            <div className="flex flex-wrap gap-1.5">
              {REP_RANGES.map(r => (
                <button key={r} onClick={() => setRr(r)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                    rr === r ? 'bg-accent/15 border-accent text-accent' : 'bg-bg-elevated border-border text-text-muted'
                  }`}>{r}</button>
              ))}
            </div>
          </div>
          <Button onClick={() => { onAdd(picked, sets, rr); onClose() }} className="w-full">
            Aggiungi — {sets}×{rr}
          </Button>
        </div>
      )}

      {/* Favorites */}
      {favs.length > 0 && (
        <div className="mb-2">
          <div className="text-[10px] text-gold tracking-widest font-semibold mb-1.5 flex items-center gap-1">
            <Star size={10} /> PREFERITI
          </div>
          {favs.map(e => (
            <div key={e.name} className="flex items-center gap-2 mb-1">
              <button onClick={() => { setPicked(e.name) }}
                className={`flex-1 text-left px-3 py-2.5 rounded-xl text-sm border transition-all ${
                  picked === e.name ? 'bg-accent/10 border-accent text-accent' : 'bg-bg-surface border-border text-text-primary'
                }`}>{e.name}</button>
              <button onClick={() => toggleFavorite(e.name)} className="text-gold p-1.5">
                <Star size={14} fill="currentColor" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Exercise list */}
      {Object.entries(grouped).map(([mus, exs]) => (
        <div key={mus} className="mb-2">
          <div className="text-[10px] text-text-muted tracking-widest font-semibold mb-1.5 uppercase">
            {MUSCLE_LABELS[mus] || mus}
          </div>
          {exs.map(e => (
            <div key={e.name} className="flex items-center gap-2 mb-1">
              <button onClick={() => setPicked(e.name)}
                className={`flex-1 text-left px-3 py-2.5 rounded-xl text-sm border transition-all ${
                  picked === e.name ? 'bg-accent/10 border-accent text-accent' : 'bg-bg-surface border-border text-text-primary'
                }`}>{e.name}</button>
              <button onClick={() => toggleFavorite(e.name)} className="text-text-muted hover:text-gold p-1.5 transition-colors">
                {favoriteExercises.includes(e.name) ? <Star size={14} fill="currentColor" className="text-gold" /> : <StarOff size={14} />}
              </button>
            </div>
          ))}
        </div>
      ))}
    </BottomSheet>
  )
}
