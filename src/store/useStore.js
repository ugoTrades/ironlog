import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { uid, calcVolume, epley } from '@/lib/utils'
import { EX_TO_MUSCLE } from '@/lib/constants'

// Debounced localStorage adapter: coalesces writes so heavy state (currentWorkout
// updated on every set tap) doesn't block the main thread on each change.
let writeTimer = null
let pendingWrites = {}
const FLUSH_DELAY = 400

const flushWrites = () => {
  for (const [k, v] of Object.entries(pendingWrites)) {
    try { localStorage.setItem(k, v) } catch (e) { /* quota / privacy */ }
  }
  pendingWrites = {}
  writeTimer = null
}

const debouncedStorage = {
  getItem: (name) => {
    if (pendingWrites[name] !== undefined) return pendingWrites[name]
    try { return localStorage.getItem(name) } catch (e) { return null }
  },
  setItem: (name, value) => {
    pendingWrites[name] = value
    if (writeTimer) clearTimeout(writeTimer)
    writeTimer = setTimeout(flushWrites, FLUSH_DELAY)
  },
  removeItem: (name) => {
    delete pendingWrites[name]
    try { localStorage.removeItem(name) } catch (e) { /* ignore */ }
  },
}

// Flush pending writes before the page unloads / hides
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', flushWrites)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushWrites()
  })
}

const getLastWeightForExercise = (workouts, exName) => {
  const sorted = [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date))
  for (const w of sorted) {
    for (const ex of (w.exercises || [])) {
      if (ex.exercise === exName && ex.sets?.length) {
        const s = ex.sets.find(s => s.weight > 0)
        if (s) return s.weight
      }
    }
  }
  return 0
}

const getLastSessionSets = (workouts, exName) => {
  const sorted = [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date))
  for (const w of sorted) {
    for (const ex of (w.exercises || [])) {
      if (ex.exercise === exName) return ex.sets || []
    }
  }
  return []
}

const detectPRs = (workouts) => {
  const best = {}
  const prs = []
  const sorted = [...workouts].sort((a, b) => new Date(a.date) - new Date(b.date))
  for (const w of sorted) {
    for (const ex of (w.exercises || [])) {
      const topSets = ex.sets?.filter(s => s.weight > 0 && s.reps > 0).sort((a, b) => b.weight - a.weight)
      const ts = topSets?.[0]
      if (!ts) continue
      const rm = epley(ts.weight, ts.reps)
      if (!best[ex.exercise] || rm > best[ex.exercise]) {
        if (best[ex.exercise]) {
          prs.push({ id: uid(), exercise: ex.exercise, weight: ts.weight, reps: ts.reps, rm, date: w.date })
        }
        best[ex.exercise] = rm
      }
    }
  }
  return prs.reverse().slice(0, 20)
}

export const useStore = create(
  persist(
    (set, get) => ({
      // User profile
      profile: null,
      onboardingComplete: false,

      // Settings
      settings: {
        unit: 'kg',
        theme: 'dark',
        restTimerDefault: 120,
        notifications: true,
      },

      // Weekly program: { 0: [...exercises], 1: [...], ... } (0=Mon, 6=Sun)
      program: {},

      // Custom day names: { 0: "Push", 1: "Pull", 2: "Legs", ... }
      dayNames: {},

      // Training phase
      trainingPhase: {
        phase: null,
        targetWeight: null,
        startDate: null,
        startWeight: null,
      },

      // Phase history
      phaseHistory: [],

      // Workouts history
      workouts: [],

      // Current active workout
      currentWorkout: null,

      // Body weight log
      bodyWeightLog: [],

      // Custom exercises
      customExercises: [],

      // PRs
      prs: [],

      // Favorites
      favoriteExercises: [],

      // Goals
      goals: [],

      // Badges
      badges: [],

      // Persistent notes per exercise name (auto-fills in new sessions)
      // shape: { 'Panca Piana Bilanciere': 'presa stretta, fermo 2s' }
      exerciseNotes: {},

      // Cloud sync state
      cloudSync: { status: 'idle', lastSync: null, message: null, enabled: true },

      // Actions
      setProfile: (profile) => set({ profile }),

      completeOnboarding: (data) => set({
        profile: { ...get().profile, ...data },
        onboardingComplete: true,
      }),

      updateSettings: (updates) => set({
        settings: { ...get().settings, ...updates },
      }),

      updateProgram: (program) => set({ program }),

      // Update a single day in the program (dayIndex 0-6)
      updateProgramDay: (dayIndex, exercises) => {
        set({ program: { ...get().program, [dayIndex]: exercises } })
      },

      // Set custom name for a day (e.g., "Push", "Upper", "Chest & Arms")
      setDayName: (dayIndex, name) => {
        set({ dayNames: { ...get().dayNames, [dayIndex]: name } })
      },

      // Swap two days in the weekly program (exercises + names)
      swapProgramDays: (dayA, dayB) => {
        const { program, dayNames } = get()
        const newProgram = { ...program }
        const newNames = { ...dayNames }
        // Swap exercises
        const tmpEx = newProgram[dayA] || []
        newProgram[dayA] = newProgram[dayB] || []
        newProgram[dayB] = tmpEx
        // Swap day names
        const tmpName = newNames[dayA] || ''
        newNames[dayA] = newNames[dayB] || ''
        newNames[dayB] = tmpName
        // Clean empty names
        if (!newNames[dayA]) delete newNames[dayA]
        if (!newNames[dayB]) delete newNames[dayB]
        set({ program: newProgram, dayNames: newNames })
      },

      setTheme: (theme) => {
        set({ settings: { ...get().settings, theme } })
        document.documentElement.className = theme
      },

      // Training phase
      setTrainingPhase: (phase, targetWeight = null) => {
        const { trainingPhase, phaseHistory, bodyWeightLog } = get()
        const currentWeight = bodyWeightLog.length
          ? bodyWeightLog[bodyWeightLog.length - 1].weight
          : get().profile?.bodyWeight || null
        if (trainingPhase.phase) {
          phaseHistory.push({
            ...trainingPhase,
            endDate: new Date().toISOString(),
            endWeight: currentWeight,
          })
        }
        set({
          trainingPhase: {
            phase,
            targetWeight,
            startDate: new Date().toISOString(),
            startWeight: currentWeight,
          },
          phaseHistory: [...phaseHistory],
        })
      },

      // Workout actions — dayIndex is 0-6 (Mon-Sun) or 'free' for free workout
      // Program exercise format: { exercise, setDefs: [{ setType, repRange },...] }
      // Legacy format: { exercise, sets (number), repRange (string) }
      startWorkout: (dayIndex) => {
        const { workouts, program, dayNames, exerciseNotes } = get()
        const todayProg = dayIndex === 'free' ? [] : (program[dayIndex] || [])
        const exercises = todayProg.map(pex => {
          const lastSets = getLastSessionSets(workouts, pex.exercise)
          // Support both new setDefs format and legacy format
          const setDefs = pex.setDefs || Array.from({ length: pex.sets || 3 }, (_, i) => ({
            setType: i === 0 ? 'top_set' : 'normal',
            repRange: pex.repRange || '8-10',
          }))
          const sets = setDefs.map((def, i) => {
            const lastSet = lastSets[i]
            return {
              id: uid(), setNum: i + 1,
              weight: lastSet?.weight || getLastWeightForExercise(workouts, pex.exercise) || 0,
              reps: lastSet?.reps || 0, done: false,
              setType: def.setType || 'normal',
              repRange: def.repRange || '8-10',
              rpe: null, rir: null,
            }
          })
          return {
            id: uid(), exercise: pex.exercise,
            muscle: EX_TO_MUSCLE[pex.exercise] || 'other',
            sets, notes: exerciseNotes[pex.exercise] || '',
          }
        })
        const dayLabel = dayIndex === 'free'
          ? 'Allenamento Libero'
          : (dayNames[dayIndex] || undefined)
        set({
          currentWorkout: {
            id: uid(), date: new Date().toISOString(),
            dayIndex, splitDay: dayLabel,
            exercises, completed: false, startTime: Date.now(),
          }
        })
      },

      addWorkoutExercise: (exercise, sets = 3, repRange = '8-10') => {
        const { currentWorkout, workouts, exerciseNotes } = get()
        if (!currentWorkout) return
        const lastSets = getLastSessionSets(workouts, exercise)
        const newSets = Array.from({ length: sets }, (_, i) => ({
          id: uid(), setNum: i + 1,
          weight: lastSets[i]?.weight || getLastWeightForExercise(workouts, exercise) || 0,
          reps: lastSets[i]?.reps || 0, done: false,
          setType: 'normal', repRange, rpe: null, rir: null,
        }))
        set({
          currentWorkout: {
            ...currentWorkout,
            exercises: [...currentWorkout.exercises, {
              id: uid(), exercise,
              muscle: EX_TO_MUSCLE[exercise] || 'other',
              sets: newSets, notes: exerciseNotes[exercise] || '',
            }]
          }
        })
      },

      // Replace exercise in current workout (keeps same set structure, swaps name + muscle)
      replaceWorkoutExercise: (exId, newExerciseName) => {
        const { currentWorkout, workouts, exerciseNotes } = get()
        if (!currentWorkout) return
        const lastSets = getLastSessionSets(workouts, newExerciseName)
        const lastW = getLastWeightForExercise(workouts, newExerciseName)
        set({
          currentWorkout: {
            ...currentWorkout,
            exercises: currentWorkout.exercises.map(e => {
              if (e.id !== exId) return e
              // Keep set count and types, but reset weights/reps to last session of new exercise
              const newSets = e.sets.map((s, i) => ({
                ...s,
                weight: lastSets[i]?.weight || lastW || 0,
                reps: lastSets[i]?.reps || 0,
                done: false,
              }))
              return {
                ...e,
                exercise: newExerciseName,
                muscle: EX_TO_MUSCLE[newExerciseName] || 'other',
                sets: newSets,
                notes: exerciseNotes[newExerciseName] || '',
              }
            })
          }
        })
      },

      // Reorder current workout exercise (direction: -1 up, +1 down)
      moveWorkoutExercise: (exId, direction) => {
        const { currentWorkout } = get()
        if (!currentWorkout) return
        const arr = [...currentWorkout.exercises]
        const idx = arr.findIndex(e => e.id === exId)
        if (idx < 0) return
        const newIdx = idx + direction
        if (newIdx < 0 || newIdx >= arr.length) return
        const [item] = arr.splice(idx, 1)
        arr.splice(newIdx, 0, item)
        set({ currentWorkout: { ...currentWorkout, exercises: arr } })
      },

      // Prepend 3 warmup sets (40%, 60%, 80% of working weight)
      addWarmupSets: (exId) => {
        const { currentWorkout } = get()
        if (!currentWorkout) return
        set({
          currentWorkout: {
            ...currentWorkout,
            exercises: currentWorkout.exercises.map(e => {
              if (e.id !== exId) return e
              // Find working weight (first non-warmup set with weight > 0, else first set)
              const working = e.sets.find(s => s.setType !== 'warm_up' && s.weight > 0)
                || e.sets.find(s => s.weight > 0)
                || e.sets[0]
              const w = working?.weight || 0
              const pcts = [0.4, 0.6, 0.8]
              const reps = [8, 5, 3]
              const round25 = v => Math.round(v / 2.5) * 2.5
              const warmups = pcts.map((p, i) => ({
                id: uid(), setNum: 0,
                weight: w > 0 ? round25(w * p) : 0,
                reps: reps[i],
                done: false,
                setType: 'warm_up',
                repRange: '',
                rpe: null, rir: null,
                isWarmup: true,
              }))
              // Avoid duplicating warmups
              const existing = e.sets.filter(s => s.setType !== 'warm_up')
              const all = [...warmups, ...existing]
              return {
                ...e,
                sets: all.map((s, i) => ({ ...s, setNum: i + 1 }))
              }
            })
          }
        })
      },

      // Update notes on current workout exercise + persist globally per exercise name
      updateWorkoutExerciseNotes: (exId, notes) => {
        const { currentWorkout, exerciseNotes } = get()
        if (!currentWorkout) return
        const ex = currentWorkout.exercises.find(e => e.id === exId)
        const updates = {
          currentWorkout: {
            ...currentWorkout,
            exercises: currentWorkout.exercises.map(e =>
              e.id !== exId ? e : { ...e, notes }
            )
          }
        }
        if (ex) {
          const cleaned = notes.trim()
          const newNotes = { ...exerciseNotes }
          if (cleaned) newNotes[ex.exercise] = cleaned
          else delete newNotes[ex.exercise]
          updates.exerciseNotes = newNotes
        }
        set(updates)
      },

      setExerciseNote: (exerciseName, note) => {
        const { exerciseNotes } = get()
        const newNotes = { ...exerciseNotes }
        const cleaned = (note || '').trim()
        if (cleaned) newNotes[exerciseName] = cleaned
        else delete newNotes[exerciseName]
        set({ exerciseNotes: newNotes })
      },

      removeWorkoutExercise: (exId) => {
        const { currentWorkout } = get()
        if (!currentWorkout) return
        set({
          currentWorkout: {
            ...currentWorkout,
            exercises: currentWorkout.exercises.filter(e => e.id !== exId),
          }
        })
      },

      updateSet: (exId, setId, updates) => {
        const { currentWorkout } = get()
        if (!currentWorkout) return
        set({
          currentWorkout: {
            ...currentWorkout,
            exercises: currentWorkout.exercises.map(e =>
              e.id !== exId ? e : {
                ...e,
                sets: e.sets.map(s => s.id !== setId ? s : { ...s, ...updates })
              }
            )
          }
        })
      },

      toggleSetDone: (exId, setId) => {
        const { currentWorkout } = get()
        if (!currentWorkout) return
        set({
          currentWorkout: {
            ...currentWorkout,
            exercises: currentWorkout.exercises.map(e =>
              e.id !== exId ? e : {
                ...e,
                sets: e.sets.map(s => s.id !== setId ? s : { ...s, done: !s.done })
              }
            )
          }
        })
      },

      addExtraSet: (exId) => {
        const { currentWorkout } = get()
        if (!currentWorkout) return
        set({
          currentWorkout: {
            ...currentWorkout,
            exercises: currentWorkout.exercises.map(e => {
              if (e.id !== exId) return e
              const last = e.sets[e.sets.length - 1]
              return {
                ...e, sets: [...e.sets, {
                  id: uid(), setNum: e.sets.length + 1,
                  weight: last?.weight || 0, reps: last?.reps || 0,
                  done: false, setType: 'normal',
                  repRange: last?.repRange || '8-10',
                  rpe: null, rir: null,
                }]
              }
            })
          }
        })
      },

      removeSet: (exId, setId) => {
        const { currentWorkout } = get()
        if (!currentWorkout) return
        set({
          currentWorkout: {
            ...currentWorkout,
            exercises: currentWorkout.exercises.map(e =>
              e.id !== exId ? e : {
                ...e,
                sets: e.sets.filter(s => s.id !== setId).map((s, i) => ({ ...s, setNum: i + 1 }))
              }
            )
          }
        })
      },

      completeWorkout: () => {
        const { currentWorkout, workouts } = get()
        if (!currentWorkout) return
        const completed = {
          ...currentWorkout, completed: true,
          endTime: Date.now(),
          duration: Math.round((Date.now() - currentWorkout.startTime) / 1000),
        }
        completed.exercises = completed.exercises.map(e => ({
          ...e, sets: e.sets.filter(s => s.done || s.reps > 0)
        }))
        completed.totalVolume = completed.exercises.reduce(
          (a, e) => a + calcVolume(e.sets), 0
        )
        const updated = [...workouts, completed]
        set({
          workouts: updated,
          currentWorkout: null,
          prs: detectPRs(updated),
        })
      },

      discardWorkout: () => set({ currentWorkout: null }),

      // Body weight
      addBodyWeight: (weight, date = new Date().toISOString()) => {
        const { bodyWeightLog } = get()
        const dateKey = new Date(date).toDateString()
        const existing = bodyWeightLog.findIndex(e => new Date(e.date).toDateString() === dateKey)
        if (existing >= 0) {
          const updated = [...bodyWeightLog]
          updated[existing] = { ...updated[existing], weight, date }
          set({ bodyWeightLog: updated })
        } else {
          set({ bodyWeightLog: [...bodyWeightLog, { id: uid(), weight, date }] })
        }
      },

      // Favorites
      toggleFavorite: (exercise) => {
        const { favoriteExercises } = get()
        if (favoriteExercises.includes(exercise)) {
          set({ favoriteExercises: favoriteExercises.filter(e => e !== exercise) })
        } else {
          set({ favoriteExercises: [...favoriteExercises, exercise] })
        }
      },

      // Custom exercises
      addCustomExercise: (name, muscle) => {
        set({ customExercises: [...get().customExercises, { name, muscle }] })
      },

      // Duplicate workout
      duplicateWorkout: (workoutId) => {
        const { workouts } = get()
        const original = workouts.find(w => w.id === workoutId)
        if (!original) return
        const duplicated = {
          ...original,
          id: uid(),
          date: new Date().toISOString(),
          exercises: original.exercises.map(e => ({
            ...e, id: uid(),
            sets: e.sets.map(s => ({ ...s, id: uid(), done: false }))
          }))
        }
        set({ currentWorkout: duplicated })
      },

      // Reset
      resetWorkouts: () => set({ workouts: [], prs: [], currentWorkout: null }),
      resetAll: () => set({
        profile: null, onboardingComplete: false,
        settings: { unit: 'kg', theme: 'dark', restTimerDefault: 120, notifications: true },
        program: {}, dayNames: {}, workouts: [], currentWorkout: null, bodyWeightLog: [],
        customExercises: [], prs: [], favoriteExercises: [], goals: [], badges: [],
        trainingPhase: { phase: null, targetWeight: null, startDate: null, startWeight: null },
        phaseHistory: [], exerciseNotes: {},
      }),

      // Cloud sync state actions
      setCloudSync: (updates) => set({ cloudSync: { ...get().cloudSync, ...updates } }),

      // Hydrate state from cloud data payload (only known fields)
      hydrateFromCloud: (data) => {
        if (!data || typeof data !== 'object') return
        const allowed = [
          'profile', 'onboardingComplete', 'settings',
          'program', 'dayNames', 'trainingPhase', 'phaseHistory',
          'workouts', 'bodyWeightLog', 'customExercises',
          'prs', 'favoriteExercises', 'goals', 'badges',
          'exerciseNotes',
        ]
        const patch = {}
        for (const k of allowed) if (data[k] !== undefined) patch[k] = data[k]
        set(patch)
      },

      // Export data
      exportData: () => {
        const state = get()
        const data = {
          profile: state.profile,
          settings: state.settings,
          program: state.program,
          workouts: state.workouts,
          bodyWeightLog: state.bodyWeightLog,
          customExercises: state.customExercises,
          favoriteExercises: state.favoriteExercises,
          exportDate: new Date().toISOString(),
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `ironlog-backup-${new Date().toISOString().slice(0, 10)}.json`
        a.click()
        URL.revokeObjectURL(url)
      },

      importData: (jsonData) => {
        try {
          const data = JSON.parse(jsonData)
          set({
            profile: data.profile || get().profile,
            settings: { ...get().settings, ...data.settings },
            program: data.program || get().program,
            workouts: data.workouts || get().workouts,
            bodyWeightLog: data.bodyWeightLog || get().bodyWeightLog,
            customExercises: data.customExercises || get().customExercises,
            favoriteExercises: data.favoriteExercises || get().favoriteExercises,
          })
          return true
        } catch {
          return false
        }
      },
    }),
    {
      name: 'ironlog-v3',
      storage: createJSONStorage(() => debouncedStorage),
      // Exclude transient state from persisted snapshot
      partialize: (state) => {
        const { cloudSync, ...persisted } = state
        return persisted
      },
    }
  )
)
