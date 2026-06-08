export const DAYS = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica']
export const DAYS_SHORT = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']

// Brushed-steel re-skin: set-type accents are now steel greys.
// Only "failure" keeps the desaturated danger red (the lone hue).
export const SET_TYPES = [
  { id: 'normal', label: 'Normale', color: '#888888' },
  { id: 'top_set', label: 'Top Set', color: '#E4E4E4' },
  { id: 'back_off', label: 'Back Off', color: '#888888' },
  { id: 'warm_up', label: 'Warm Up', color: '#555555' },
  { id: 'drop_set', label: 'Drop Set', color: '#A0A0A0' },
  { id: 'amrap', label: 'AMRAP', color: '#B0B0B0' },
  { id: 'failure', label: 'Failure', color: '#8B3A3A' },
  { id: 'rest_pause', label: 'Rest Pause', color: '#A0A0A0' },
  { id: 'custom', label: 'Personalizzato', color: '#6B6B6B' },
]

export const REP_RANGES = ['4-6', '6-8', '8-10', '10-12', '12-15', '15-20']

export const EXPERIENCE_LEVELS = [
  { id: 'beginner', label: 'Principiante', desc: '0-1 anno' },
  { id: 'intermediate', label: 'Intermedio', desc: '1-3 anni' },
  { id: 'advanced', label: 'Avanzato', desc: '3-5 anni' },
  { id: 'expert', label: 'Esperto', desc: '5+ anni' },
]

// Phase accents desaturated to the steel ramp (emoji tags kept).
export const TRAINING_PHASES = [
  { id: 'bulk', label: 'Massa', icon: '💪', color: '#CCCCCC', desc: 'Aumento massa muscolare e peso' },
  { id: 'cut', label: 'Definizione', icon: '🔥', color: '#B0B0B0', desc: 'Riduzione grasso, mantenere muscolo' },
  { id: 'strength', label: 'Forza', icon: '🏋️', color: '#E4E4E4', desc: 'Focus su carichi pesanti' },
  { id: 'maintenance', label: 'Mantenimento', icon: '⚖️', color: '#888888', desc: 'Mantieni i risultati ottenuti' },
  { id: 'recomp', label: 'Ricomposizione', icon: '🔄', color: '#A0A0A0', desc: 'Perdere grasso e costruire muscolo' },
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
