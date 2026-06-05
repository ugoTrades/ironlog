// Cloud sync: backup app state to Supabase user_state table.
// Debounced upload + initial download on login.

import { supabase } from './supabase'

const SYNC_KEYS = [
  'profile', 'onboardingComplete', 'settings',
  'program', 'dayNames', 'trainingPhase', 'phaseHistory',
  'workouts', 'bodyWeightLog', 'customExercises',
  'prs', 'favoriteExercises', 'goals', 'badges',
  'exerciseNotes',
]

export function extractSyncableState(state) {
  const out = {}
  for (const k of SYNC_KEYS) {
    if (state[k] !== undefined) out[k] = state[k]
  }
  return out
}

let uploadTimer = null
let lastUploadAt = 0
let pendingState = null
let onStatusChange = () => {}

export function setSyncStatusListener(fn) { onStatusChange = fn || (() => {}) }

export async function downloadCloudState(userId) {
  if (!supabase || !userId) return null
  onStatusChange({ status: 'downloading' })
  try {
    const { data, error } = await supabase
      .from('user_state')
      .select('data, updated_at')
      .eq('user_id', userId)
      .maybeSingle()
    if (error) {
      onStatusChange({ status: 'error', message: error.message })
      return null
    }
    onStatusChange({ status: 'idle', lastSync: data?.updated_at })
    return data
  } catch (e) {
    onStatusChange({ status: 'error', message: e.message })
    return null
  }
}

export async function uploadCloudState(userId, state) {
  if (!supabase || !userId) return false
  onStatusChange({ status: 'uploading' })
  try {
    const payload = extractSyncableState(state)
    const { error } = await supabase
      .from('user_state')
      .upsert({ user_id: userId, data: payload, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    if (error) {
      onStatusChange({ status: 'error', message: error.message })
      return false
    }
    lastUploadAt = Date.now()
    onStatusChange({ status: 'idle', lastSync: new Date().toISOString() })
    return true
  } catch (e) {
    onStatusChange({ status: 'error', message: e.message })
    return false
  }
}

export function scheduleUpload(userId, state, delay = 3000) {
  pendingState = state
  if (uploadTimer) clearTimeout(uploadTimer)
  uploadTimer = setTimeout(() => {
    uploadTimer = null
    const s = pendingState
    pendingState = null
    if (s) uploadCloudState(userId, s)
  }, delay)
}

export async function flushUpload(userId) {
  if (uploadTimer) {
    clearTimeout(uploadTimer)
    uploadTimer = null
  }
  if (pendingState) {
    const s = pendingState
    pendingState = null
    await uploadCloudState(userId, s)
  }
}
