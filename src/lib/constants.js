export const DAYS = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica']
export const DAYS_SHORT = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']

export const SET_TYPES = [
  { id: 'normal', label: 'Normale', color: '#6366f1' },
  { id: 'top_set', label: 'Top Set', color: '#f59e0b' },
  { id: 'back_off', label: 'Back Off', color: '#14b8a6' },
  { id: 'warm_up', label: 'Warm Up', color: '#94a3b8' },
  { id: 'drop_set', label: 'Drop Set', color: '#a855f7' },
  { id: 'amrap', label: 'AMRAP', color: '#ef4444' },
  { id: 'failure', label: 'Failure', color: '#f43f5e' },
  { id: 'rest_pause', label: 'Rest Pause', color: '#f97316' },
  { id: 'custom', label: 'Personalizzato', color: '#64748b' },
]

export const REP_RANGES = ['4-6', '6-8', '8-10', '10-12', '12-15', '15-20']

export const EXPERIENCE_LEVELS = [
  { id: 'beginner', label: 'Principiante', desc: '0-1 anno' },
  { id: 'intermediate', label: 'Intermedio', desc: '1-3 anni' },
  { id: 'advanced', label: 'Avanzato', desc: '3-5 anni' },
  { id: 'expert', label: 'Esperto', desc: '5+ anni' },
]

export const TRAINING_PHASES = [
  { id: 'bulk', label: 'Massa', icon: '💪', color: '#22c55e', desc: 'Aumento massa muscolare e peso' },
  { id: 'cut', label: 'Definizione', icon: '🔥', color: '#ef4444', desc: 'Riduzione grasso, mantenere muscolo' },
  { id: 'strength', label: 'Forza', icon: '🏋️', color: '#f59e0b', desc: 'Focus su carichi pesanti' },
  { id: 'maintenance', label: 'Mantenimento', icon: '⚖️', color: '#6366f1', desc: 'Mantieni i risultati ottenuti' },
  { id: 'recomp', label: 'Ricomposizione', icon: '🔄', color: '#a855f7', desc: 'Perdere grasso e costruire muscolo' },
]

// Muscle groups for the recovery grid on the dashboard
export const RECOVERY_MUSCLES = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps',
  'quadriceps', 'hamstrings', 'glutes',
]

export const RECOVERY_LABELS = {
  chest: 'Petto', back: 'Schiena', shoulders: 'Spalle',
  biceps: 'Bicipiti', triceps: 'Tricipiti', quadriceps: 'Quadri',
  hamstrings: 'Femorali', glutes: 'Glutei',
}

// Exercise DB, muscle groups, labels, and EX_TO_MUSCLE are imported from exerciseDB.js
export { EXERCISE_DB, MUSCLE_GROUPS, MUSCLE_LABELS, EX_TO_MUSCLE } from './exerciseDB'
