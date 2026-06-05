import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useStore } from '@/store/useStore'
import { useAuth } from '@/store/useAuth'
import { DAYS, DAYS_SHORT, TRAINING_PHASES } from '@/lib/constants'
import {
  AlertTriangle, Sun, Moon, Scale, Download, Upload,
  LogOut, User, Target, ChevronRight, Cloud, CloudOff, RefreshCw, Check
} from 'lucide-react'
import { uploadCloudState, downloadCloudState } from '@/lib/cloudSync'
import Card, { CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'

export default function SettingsPage() {
  const store = useStore()
  const { settings, profile, program, dayNames, trainingPhase, phaseHistory,
    updateSettings, addBodyWeight, exportData, importData,
    resetWorkouts, resetAll, setTheme, setTrainingPhase,
    cloudSync, setCloudSync, hydrateFromCloud } = store
  const { user, signOut } = useAuth()
  const [showResetW, setShowResetW] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [showPhase, setShowPhase] = useState(false)
  const [newPhase, setNewPhase] = useState('')
  const [newTarget, setNewTarget] = useState('')
  const [bw, setBw] = useState('')
  const [importResult, setImportResult] = useState(null)
  const fileRef = useRef(null)

  const currentPhase = TRAINING_PHASES.find(p => p.id === trainingPhase?.phase)

  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const ok = importData(ev.target.result)
      setImportResult(ok ? 'success' : 'error')
      setTimeout(() => setImportResult(null), 3000)
    }
    reader.readAsText(file)
  }

  const handlePhaseChange = () => {
    if (newPhase) {
      setTrainingPhase(newPhase, parseFloat(newTarget) || null)
      setShowPhase(false)
      setNewPhase('')
      setNewTarget('')
    }
  }

  return (
    <div className="px-4 pt-5 pb-4">
      <h2 className="text-2xl font-bold tracking-wide mb-5 animate-fade-in">IMPOSTAZIONI</h2>

      <div className="stagger-up">
        {/* Profile */}
        <Card className="mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/15 flex items-center justify-center">
              <User size={22} className="text-accent" />
            </div>
            <div className="flex-1">
              <div className="font-bold">{profile?.name || 'Utente'}</div>
              <div className="text-xs text-text-muted">{user?.email || 'Modalità offline'}</div>
            </div>
            {user && (
              <Button size="sm" variant="ghost" onClick={signOut}>
                <LogOut size={14} /> Esci
              </Button>
            )}
          </div>
        </Card>

        {/* Cloud Sync */}
        {user && (
          <Card className="mb-3">
            <CardTitle>BACKUP CLOUD</CardTitle>
            <div className="flex items-center gap-3 mt-2">
              <div className={cn(
                'w-11 h-11 rounded-2xl flex items-center justify-center border',
                cloudSync?.enabled === false ? 'bg-text-muted/10 border-border'
                  : cloudSync?.status === 'error' ? 'bg-danger/10 border-danger/30'
                  : cloudSync?.status === 'uploading' || cloudSync?.status === 'downloading' ? 'bg-accent/10 border-accent/30'
                  : 'bg-success/10 border-success/30'
              )}>
                {cloudSync?.enabled === false ? <CloudOff size={18} className="text-text-muted" />
                  : cloudSync?.status === 'uploading' || cloudSync?.status === 'downloading' ? <RefreshCw size={18} className="text-accent animate-spin" />
                  : cloudSync?.status === 'error' ? <CloudOff size={18} className="text-danger" />
                  : <Cloud size={18} className="text-success" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">
                  {cloudSync?.enabled === false ? 'Disattivato'
                    : cloudSync?.status === 'uploading' ? 'Salvataggio…'
                    : cloudSync?.status === 'downloading' ? 'Caricamento…'
                    : cloudSync?.status === 'error' ? 'Errore'
                    : 'Sincronizzato'}
                </div>
                <div className="text-[11px] text-text-muted truncate">
                  {cloudSync?.message
                    ? cloudSync.message
                    : cloudSync?.lastSync
                    ? `Ultimo: ${new Date(cloudSync.lastSync).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}`
                    : 'Dati salvati automaticamente'}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="secondary" className="flex-1"
                onClick={async () => { await uploadCloudState(user.id, store) }}>
                <Upload size={13} /> Carica ora
              </Button>
              <Button size="sm" variant="ghost" className="flex-1"
                onClick={async () => {
                  const remote = await downloadCloudState(user.id)
                  if (remote?.data) hydrateFromCloud(remote.data)
                }}>
                <Download size={13} /> Scarica
              </Button>
              <Button size="sm" variant="ghost"
                onClick={() => setCloudSync({ enabled: cloudSync?.enabled === false })}>
                {cloudSync?.enabled === false ? 'Attiva' : 'Pausa'}
              </Button>
            </div>
          </Card>
        )}

        {/* Training Phase */}
        <Card className="mb-3" style={currentPhase ? {
          borderColor: `${currentPhase.color}20`,
          background: `linear-gradient(135deg, var(--color-bg-card), ${currentPhase.color}04)`
        } : {}}>
          <CardTitle>FASE DI ALLENAMENTO</CardTitle>
          {currentPhase ? (
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{currentPhase.icon}</span>
              <div className="flex-1">
                <div className="font-bold text-sm" style={{ color: currentPhase.color }}>{currentPhase.label}</div>
                <div className="text-[11px] text-text-muted">{currentPhase.desc}</div>
                {trainingPhase.targetWeight && (
                  <div className="text-[11px] text-text-muted mt-0.5">
                    Obiettivo: <span className="font-mono font-bold">{trainingPhase.targetWeight} {settings.unit}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-sm text-text-muted mb-3">Nessuna fase impostata</div>
          )}
          <Button size="sm" variant="secondary" onClick={() => {
            setNewPhase(trainingPhase?.phase || '')
            setNewTarget(trainingPhase?.targetWeight?.toString() || '')
            setShowPhase(true)
          }} className="w-full">
            <Target size={14} /> {currentPhase ? 'Cambia fase' : 'Imposta fase'}
          </Button>

          {phaseHistory.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <div className="text-[9px] text-text-muted tracking-[0.2em] font-semibold mb-2">STORICO FASI</div>
              {phaseHistory.slice(-3).reverse().map((ph, i) => {
                const p = TRAINING_PHASES.find(t => t.id === ph.phase)
                return p ? (
                  <div key={i} className="flex items-center gap-2 py-2 border-b border-border/20 last:border-0">
                    <span className="text-sm">{p.icon}</span>
                    <div className="flex-1">
                      <span className="text-xs font-semibold" style={{ color: p.color }}>{p.label}</span>
                      {ph.startWeight && ph.endWeight && (
                        <span className="text-[10px] text-text-muted ml-2">
                          {ph.startWeight} → {ph.endWeight} {settings.unit}
                        </span>
                      )}
                    </div>
                  </div>
                ) : null
              })}
            </div>
          )}
        </Card>

        {/* Theme */}
        <Card className="mb-3">
          <CardTitle>TEMA</CardTitle>
          <div className="flex gap-2">
            {[{ id: 'dark', label: 'Scuro', icon: Moon }, { id: 'light', label: 'Chiaro', icon: Sun }].map(t => (
              <button key={t.id} onClick={() => setTheme(t.id)}
                className={`flex-1 py-3.5 rounded-xl font-semibold text-sm border flex items-center justify-center gap-2 transition-all duration-300 ${
                  settings.theme === t.id
                    ? 'bg-accent/8 border-accent/30 text-accent'
                    : 'bg-bg-surface border-border text-text-muted hover:border-border-strong'
                }`}>
                <t.icon size={16} /> {t.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Unit */}
        <Card className="mb-3">
          <CardTitle>UNITÀ DI MISURA</CardTitle>
          <div className="flex gap-2">
            {['kg', 'lbs'].map(u => (
              <button key={u} onClick={() => updateSettings({ unit: u })}
                className={`flex-1 py-3.5 rounded-xl font-black text-lg border-2 transition-all duration-300 ${
                  settings.unit === u
                    ? 'bg-accent/8 border-accent text-accent glow-accent'
                    : 'bg-bg-surface border-border text-text-muted hover:border-border-strong'
                }`}>
                {u.toUpperCase()}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-danger/80 mt-2.5">Cambiare unità non converte i dati esistenti.</p>
        </Card>

        {/* Program overview */}
        <Card className="mb-3">
          <CardTitle>PROGRAMMA SETTIMANALE</CardTitle>
          <div className="space-y-0">
            {DAYS.map((day, i) => {
              const dayProg = program[i] || []
              return (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-border/25 last:border-0">
                  <div className="text-sm font-semibold">
                    {dayNames[i] ? <span className="text-accent">{dayNames[i]}</span> : ''}{dayNames[i] ? ' — ' : ''}{day}
                  </div>
                  {dayProg.length > 0 ? (
                    <div className="text-[11px] text-text-muted">
                      {dayProg.length} esercizi · {dayProg.reduce((a, e) => a + (e.setDefs?.length || e.sets || 0), 0)} serie
                    </div>
                  ) : (
                    <div className="text-[11px] text-text-muted/30">Riposo</div>
                  )}
                </div>
              )
            })}
          </div>
          <Button size="sm" variant="secondary" onClick={() => window.location.href = '/app/workout'} className="w-full mt-3">
            Modifica programma
          </Button>
        </Card>

        {/* Body weight */}
        <Card className="mb-3">
          <CardTitle>PESO CORPOREO</CardTitle>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Scale size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="number" value={bw} onChange={e => setBw(e.target.value)}
                placeholder={`Peso in ${settings.unit}`}
                className="w-full bg-bg-surface border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted"
              />
            </div>
            <Button onClick={() => {
              if (bw) { addBodyWeight(parseFloat(bw)); setBw('') }
            }} disabled={!bw}>Salva</Button>
          </div>
          {store.bodyWeightLog.length > 0 && (
            <div className="mt-3 space-y-0">
              {[...store.bodyWeightLog].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5).map(e => (
                <div key={e.id} className="flex justify-between text-xs py-2 border-b border-border/20 last:border-0">
                  <span className="text-text-muted">{new Date(e.date).toLocaleDateString('it-IT')}</span>
                  <span className="font-mono font-bold">{e.weight} {settings.unit}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Export/Import */}
        <Card className="mb-3">
          <CardTitle>DATI</CardTitle>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={exportData} className="flex-1" size="sm">
              <Download size={14} /> Esporta
            </Button>
            <Button variant="secondary" onClick={() => fileRef.current?.click()} className="flex-1" size="sm">
              <Upload size={14} /> Importa
            </Button>
            <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          </div>
          {importResult === 'success' && (
            <p className="text-xs text-success bg-success/8 border border-success/15 rounded-xl px-3.5 py-2 mt-2 animate-slide-down">Dati importati con successo!</p>
          )}
          {importResult === 'error' && (
            <p className="text-xs text-danger bg-danger/8 border border-danger/15 rounded-xl px-3.5 py-2 mt-2 animate-slide-down">Errore nell'importazione.</p>
          )}
        </Card>

        {/* Danger zone */}
        <Card className="mb-3 !border-danger/15">
          <CardTitle className="!text-danger">ZONA PERICOLO</CardTitle>
          <Button variant="secondary" onClick={() => setShowResetW(true)} className="w-full mb-2 !border-danger/20 !text-danger" size="sm">
            Cancella storico allenamenti
          </Button>
          <Button variant="danger" onClick={() => setShowReset(true)} className="w-full" size="sm">
            Reset completo app
          </Button>
        </Card>

        <div className="text-center text-[10px] text-text-muted/30 mt-8 mb-2">
          IRONLOG v3.0 — Built with passion
        </div>
      </div>

      {/* Phase modal */}
      <Modal open={showPhase} onClose={() => setShowPhase(false)}>
        <h3 className="text-lg font-bold mb-5">Fase di allenamento</h3>
        <div className="space-y-2 mb-5">
          {TRAINING_PHASES.map(p => (
            <button key={p.id} onClick={() => setNewPhase(p.id)}
              className={`w-full text-left px-3.5 py-3 rounded-xl border transition-all duration-300 flex items-center gap-3 ${
                newPhase === p.id ? 'glow-accent' : 'bg-bg-surface border-border hover:border-border-strong'
              }`}
              style={newPhase === p.id ? { background: `${p.color}0a`, borderColor: p.color } : {}}>
              <span className="text-lg">{p.icon}</span>
              <div>
                <div className="font-semibold text-sm" style={newPhase === p.id ? { color: p.color } : {}}>{p.label}</div>
                <div className="text-[10px] text-text-muted">{p.desc}</div>
              </div>
            </button>
          ))}
        </div>
        {newPhase && (
          <div className="mb-5 animate-fade-in">
            <label className="text-xs text-text-muted tracking-[0.15em] block mb-2">
              PESO OBIETTIVO ({settings.unit}) — opzionale
            </label>
            <input type="number" value={newTarget} onChange={e => setNewTarget(e.target.value)}
              placeholder="es. 80"
              className="w-full bg-bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted" />
          </div>
        )}
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setShowPhase(false)} className="flex-1">Annulla</Button>
          <Button onClick={handlePhaseChange} disabled={!newPhase} className="flex-1">Salva</Button>
        </div>
      </Modal>

      <Modal open={showResetW} onClose={() => setShowResetW(false)}>
        <h3 className="text-lg font-bold mb-2 text-center">Cancellare lo storico?</h3>
        <p className="text-sm text-text-muted text-center mb-6">Tutti gli allenamenti saranno eliminati.</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setShowResetW(false)} className="flex-1">Annulla</Button>
          <Button variant="danger" onClick={() => { resetWorkouts(); setShowResetW(false) }} className="flex-1">Cancella</Button>
        </div>
      </Modal>

      <Modal open={showReset} onClose={() => setShowReset(false)}>
        <div className="text-center">
          <div className="animate-scale-spring">
            <AlertTriangle size={36} className="text-danger mx-auto mb-4" />
          </div>
          <h3 className="text-lg font-bold mb-2">Reset completo?</h3>
          <p className="text-sm text-text-muted mb-6">Tutto sarà cancellato.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setShowReset(false)} className="flex-1">Annulla</Button>
          <Button variant="danger" onClick={() => { resetAll(); setShowReset(false) }} className="flex-1">Reset</Button>
        </div>
      </Modal>
    </div>
  )
}
