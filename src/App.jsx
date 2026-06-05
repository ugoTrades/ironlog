import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { useStore } from '@/store/useStore'
import { useAuth } from '@/store/useAuth'
import { downloadCloudState, scheduleUpload, setSyncStatusListener, flushUpload } from '@/lib/cloudSync'
import LoginPage from '@/pages/LoginPage'
import OnboardingPage from '@/pages/OnboardingPage'
import DashboardPage from '@/pages/DashboardPage'
import WorkoutPage from '@/pages/WorkoutPage'
import StatsPage from '@/pages/StatsPage'
import HistoryPage from '@/pages/HistoryPage'
import SettingsPage from '@/pages/SettingsPage'
import AppLayout from '@/components/layout/AppLayout'

function AppGuard({ children }) {
  const onboardingComplete = useStore(s => s.onboardingComplete)
  const user = useAuth(s => s.user)
  const authLoading = useAuth(s => s.loading)
  const cloudSync = useStore(s => s.cloudSync)

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    )
  }

  // If user is logged in but initial cloud sync hasn't completed, wait for it
  // before deciding whether to redirect to onboarding.
  if (user && !cloudSync?.hasInitialSync) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg gap-3">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        <div className="text-xs text-text-muted tracking-widest">Carico i tuoi dati...</div>
      </div>
    )
  }

  if (!onboardingComplete) return <Navigate to="/onboarding" replace />
  return children
}

function CloudSyncManager() {
  const user = useAuth(s => s.user)
  const setCloudSync = useStore(s => s.setCloudSync)
  const hydrateFromCloud = useStore(s => s.hydrateFromCloud)
  const enabled = useStore(s => s.cloudSync?.enabled !== false)
  const hydratedRef = useRef(false)
  const initialStateRef = useRef(null)

  // Subscribe to status updates from cloudSync module
  useEffect(() => {
    setSyncStatusListener((status) => setCloudSync(status))
    return () => setSyncStatusListener(null)
  }, [setCloudSync])

  // On login: download cloud state (merge — cloud wins if newer)
  useEffect(() => {
    if (!user || !enabled || hydratedRef.current) return
    hydratedRef.current = true
    ;(async () => {
      const remote = await downloadCloudState(user.id)
      if (remote?.data && Object.keys(remote.data).length > 0) {
        hydrateFromCloud(remote.data)
      } else {
        // No remote state — push current local state up
        scheduleUpload(user.id, useStore.getState(), 500)
      }
      // Signal that initial sync attempt has completed so AppGuard can proceed
      setCloudSync({ hasInitialSync: true })
    })()
  }, [user, enabled, hydrateFromCloud, setCloudSync])

  // Reset hydration flag on logout
  useEffect(() => {
    if (!user) {
      hydratedRef.current = false
      setCloudSync({ hasInitialSync: false })
    }
  }, [user, setCloudSync])

  // Subscribe to store changes and schedule debounced uploads
  useEffect(() => {
    if (!user || !enabled) return
    const unsub = useStore.subscribe((state, prev) => {
      // Only sync if a syncable field changed
      const changed = state.workouts !== prev.workouts
        || state.program !== prev.program
        || state.profile !== prev.profile
        || state.settings !== prev.settings
        || state.bodyWeightLog !== prev.bodyWeightLog
        || state.customExercises !== prev.customExercises
        || state.favoriteExercises !== prev.favoriteExercises
        || state.exerciseNotes !== prev.exerciseNotes
        || state.dayNames !== prev.dayNames
        || state.trainingPhase !== prev.trainingPhase
        || state.prs !== prev.prs
      if (changed) scheduleUpload(user.id, state, 2500)
    })
    return unsub
  }, [user, enabled])

  // Flush on page hide / before unload
  useEffect(() => {
    if (!user) return
    const handler = () => { flushUpload(user.id) }
    window.addEventListener('beforeunload', handler)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') handler()
    })
    return () => window.removeEventListener('beforeunload', handler)
  }, [user])

  return null
}

export default function App() {
  const { initialize } = useAuth()
  const theme = useStore(s => s.settings.theme)

  useEffect(() => { initialize() }, [])
  useEffect(() => { document.documentElement.className = theme }, [theme])

  return (
    <BrowserRouter>
      <CloudSyncManager />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/app" element={<AppGuard><AppLayout /></AppGuard>}>
          <Route index element={<DashboardPage />} />
          <Route path="workout" element={<WorkoutPage />} />
          <Route path="stats" element={<StatsPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

function AuthCallback() {
  useEffect(() => {
    const hash = window.location.hash
    if (hash) {
      window.location.replace('/onboarding')
    } else {
      window.location.replace('/onboarding')
    }
  }, [])
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="text-accent text-lg font-bold tracking-widest">Autenticazione...</div>
    </div>
  )
}
