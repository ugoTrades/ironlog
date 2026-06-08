import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { EXPERIENCE_LEVELS, TRAINING_PHASES } from '@/lib/constants'
import { Dumbbell, ChevronRight, User, Scale, Ruler, Calendar, Target, ArrowLeft } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { completeOnboarding, updateSettings, setTrainingPhase, onboardingComplete } = useStore()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    name: '', weight: '', height: '', age: '', sex: '',
    experience: '', phase: '', targetWeight: '', unit: 'kg',
  })

  if (onboardingComplete) {
    navigate('/app')
    return null
  }

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const finish = () => {
    completeOnboarding({
      name: form.name,
      bodyWeight: parseFloat(form.weight) || 0,
      height: parseFloat(form.height) || 0,
      age: parseInt(form.age) || 0,
      sex: form.sex,
      experience: form.experience,
    })
    updateSettings({ unit: form.unit })
    if (form.phase) {
      setTrainingPhase(form.phase, parseFloat(form.targetWeight) || null)
    }
    if (form.weight) {
      useStore.getState().addBodyWeight(parseFloat(form.weight))
    }
    navigate('/app')
  }

  const canProceed = () => {
    if (step === 1) return form.name.trim()
    if (step === 2) return form.weight && form.height
    if (step === 3) return form.age && form.sex
    if (step === 4) return form.experience
    if (step === 5) return form.phase
    return true
  }

  const totalSteps = 6

  const wrap = 'min-h-screen min-h-dvh bg-bg flex flex-col items-center justify-center px-5 py-10 relative overflow-hidden'
  const glow = 'absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-accent/4 rounded-full blur-[100px] pointer-events-none'

  if (step === 0) return (
    <div className={wrap}>
      <div className={glow} />
      <div className="relative z-10 text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-40 h-40 rounded-3xl bg-black mb-6 animate-float shadow-[0_0_60px_rgba(204,204,204,0.18)] overflow-hidden">
          <img src="/logo.png" alt="IronLog" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none' }} />
        </div>
        <p className="text-text-muted tracking-[0.25em] text-sm mt-3 mb-16">TRACK. PROGRESS. DOMINATE.</p>
        <Button size="xl" onClick={() => setStep(1)} className="mx-auto">
          INIZIA <ChevronRight size={20} />
        </Button>
      </div>
    </div>
  )

  return (
    <div className={wrap}>
      <div className={glow} />
      <div className="relative z-10 w-full max-w-sm" key={step}>
        {/* Progress */}
        <div className="flex items-center gap-2 mb-2 animate-fade-in">
          <button onClick={() => setStep(Math.max(0, step - 1))} className="text-text-muted hover:text-text-primary p-1 transition-colors duration-200">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 h-1 bg-bg-surface rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all duration-700 ease-out" style={{ width: `${(step / totalSteps) * 100}%` }} />
          </div>
          <span className="text-[10px] text-text-muted tracking-[0.15em]">{step}/{totalSteps}</span>
        </div>

        {/* Step 1: Name */}
        {step === 1 && (
          <div className="mt-10 animate-slide-up">
            <User size={28} className="text-accent mb-5" />
            <h2 className="text-3xl font-bold mb-2">Come ti chiami?</h2>
            <p className="text-text-muted text-sm mb-10">Il tuo nome apparirà nella dashboard.</p>
            <input
              value={form.name} onChange={e => update('name', e.target.value)}
              placeholder="Il tuo nome" autoFocus
              className="w-full bg-bg-surface border border-border rounded-xl px-4 py-3.5 text-lg text-text-primary placeholder:text-text-muted"
            />
          </div>
        )}

        {/* Step 2: Body */}
        {step === 2 && (
          <div className="mt-10 animate-slide-up">
            <Scale size={28} className="text-accent mb-5" />
            <h2 className="text-3xl font-bold mb-2">Il tuo fisico</h2>
            <p className="text-text-muted text-sm mb-10">Questi dati ci aiutano a personalizzare l'esperienza.</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-muted tracking-[0.2em] block mb-2">PESO ({form.unit})</label>
                <input type="number" value={form.weight} onChange={e => update('weight', e.target.value)}
                  placeholder={form.unit === 'kg' ? '75' : '165'}
                  className="w-full bg-bg-surface border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted" />
              </div>
              <div>
                <label className="text-xs text-text-muted tracking-[0.2em] block mb-2">ALTEZZA (cm)</label>
                <input type="number" value={form.height} onChange={e => update('height', e.target.value)}
                  placeholder="178"
                  className="w-full bg-bg-surface border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted" />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Age + Sex */}
        {step === 3 && (
          <div className="mt-10 animate-slide-up">
            <Calendar size={28} className="text-accent mb-5" />
            <h2 className="text-3xl font-bold mb-2">Età e sesso</h2>
            <p className="text-text-muted text-sm mb-10">Informazioni per i tuoi progressi.</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-muted tracking-[0.2em] block mb-2">ETÀ</label>
                <input type="number" value={form.age} onChange={e => update('age', e.target.value)}
                  placeholder="25"
                  className="w-full bg-bg-surface border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted" />
              </div>
              <div>
                <label className="text-xs text-text-muted tracking-[0.2em] block mb-2">SESSO</label>
                <div className="grid grid-cols-2 gap-3">
                  {[{ id: 'M', label: 'Uomo' }, { id: 'F', label: 'Donna' }].map(s => (
                    <button key={s.id} onClick={() => update('sex', s.id)}
                      className={`py-3.5 rounded-xl font-semibold text-sm border transition-all duration-300 ${
                        form.sex === s.id
                          ? 'bg-accent/8 border-accent text-accent glow-accent'
                          : 'bg-bg-surface border-border text-text-muted hover:border-border-strong'
                      }`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Experience */}
        {step === 4 && (
          <div className="mt-10 animate-slide-up">
            <Dumbbell size={28} className="text-accent mb-5" />
            <h2 className="text-3xl font-bold mb-2">Esperienza</h2>
            <p className="text-text-muted text-sm mb-10">Da quanto ti alleni?</p>
            <div className="space-y-3">
              {EXPERIENCE_LEVELS.map(l => (
                <button key={l.id} onClick={() => update('experience', l.id)}
                  className={`w-full text-left px-4 py-4 rounded-xl border transition-all duration-300 ${
                    form.experience === l.id
                      ? 'bg-accent/8 border-accent glow-accent'
                      : 'bg-bg-surface border-border hover:border-border-strong'
                  }`}>
                  <div className={`font-semibold ${form.experience === l.id ? 'text-accent' : 'text-text-primary'}`}>{l.label}</div>
                  <div className="text-xs text-text-muted mt-0.5">{l.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Training Phase + Target Weight */}
        {step === 5 && (
          <div className="mt-10 animate-slide-up">
            <Target size={28} className="text-accent mb-5" />
            <h2 className="text-3xl font-bold mb-2">Fase attuale</h2>
            <p className="text-text-muted text-sm mb-8">In che fase del tuo percorso sei? Puoi cambiarla in qualsiasi momento.</p>
            <div className="space-y-2 mb-6">
              {TRAINING_PHASES.map(p => (
                <button key={p.id} onClick={() => update('phase', p.id)}
                  className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-300 flex items-center gap-3 ${
                    form.phase === p.id
                      ? 'border-accent glow-accent'
                      : 'bg-bg-surface border-border hover:border-border-strong'
                  }`}
                  style={form.phase === p.id ? { background: `${p.color}08`, borderColor: p.color } : {}}>
                  <span className="text-xl">{p.icon}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-sm" style={form.phase === p.id ? { color: p.color } : {}}>{p.label}</div>
                    <div className="text-[11px] text-text-muted">{p.desc}</div>
                  </div>
                </button>
              ))}
            </div>
            {form.phase && (
              <div className="animate-fade-in">
                <label className="text-xs text-text-muted tracking-[0.15em] block mb-2">
                  PESO OBIETTIVO ({form.unit}) <span className="text-text-muted/40">— opzionale</span>
                </label>
                <input type="number" value={form.targetWeight} onChange={e => update('targetWeight', e.target.value)}
                  placeholder={form.phase === 'bulk' ? '85' : form.phase === 'cut' ? '70' : '75'}
                  className="w-full bg-bg-surface border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted" />
              </div>
            )}
          </div>
        )}

        {/* Step 6: Unit */}
        {step === 6 && (
          <div className="mt-10 text-center animate-slide-up">
            <Ruler size={28} className="text-accent mb-5 mx-auto" />
            <h2 className="text-3xl font-bold mb-2">Unità di misura</h2>
            <p className="text-text-muted text-sm mb-10">Come misuri i pesi?</p>
            <div className="flex gap-4 justify-center mb-12">
              {['kg', 'lbs'].map(u => (
                <button key={u} onClick={() => update('unit', u)}
                  className={`w-28 h-20 rounded-2xl border-2 font-black text-2xl tracking-wider transition-all duration-300 ${
                    form.unit === u
                      ? 'bg-accent/8 border-accent text-accent glow-accent'
                      : 'bg-bg-surface border-border text-text-muted hover:border-border-strong'
                  }`}>
                  {u.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-10 flex gap-3">
          {step < totalSteps ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canProceed()} className="flex-1" size="lg">
              Avanti <ChevronRight size={18} />
            </Button>
          ) : (
            <Button onClick={finish} variant="gold" className="flex-1" size="lg">
              INIZIA AD ALLENARTI
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
