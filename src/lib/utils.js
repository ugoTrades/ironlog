export const uid = () => Math.random().toString(36).slice(2, 9)

export const epley = (w, r) => r <= 1 ? w : Math.round(w * (1 + r / 30) * 10) / 10

export const calcVolume = (sets = []) =>
  sets.reduce((acc, s) => acc + (s.weight || 0) * (s.reps || 0), 0)

export const cn = (...classes) =>
  classes.filter(Boolean).join(' ')

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })

export const formatDateFull = (iso) =>
  new Date(iso).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })

export const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export const daysBetween = (a, b) =>
  Math.round((new Date(b) - new Date(a)) / 864e5)

export const getDayOfWeek = (date = new Date()) =>
  (date.getDay() + 6) % 7
