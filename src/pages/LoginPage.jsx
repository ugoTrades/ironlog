import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/store/useAuth'
import { Dumbbell, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function LoginPage() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()
  const { user, loading: authLoading, signIn, signUp, signInWithGoogle, resetPassword } = useAuth()

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) navigate('/app', { replace: true })
  }, [user, authLoading, navigate])

  // Show loading screen while we check existing session
  if (authLoading) {
    return (
      <div className="min-h-screen min-h-dvh flex items-center justify-center bg-bg">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (mode === 'reset') {
      const { error } = await resetPassword(email)
      if (error) setError(error.message)
      else setSuccess('Email di recupero inviata. Controlla la tua casella.')
      setLoading(false)
      return
    }

    if (mode === 'signup') {
      const { error } = await signUp(email, password)
      if (error) setError(error.message)
      else setSuccess('Account creato! Controlla la tua email per confermare.')
      setLoading(false)
      return
    }

    const { error } = await signIn(email, password)
    if (error) setError(error.message)
    else navigate('/app')
    setLoading(false)
  }

  const handleSkip = () => navigate('/onboarding')

  return (
    <div className="min-h-screen min-h-dvh flex flex-col items-center justify-center px-5 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-accent/6 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[250px] h-[250px] bg-accent/4 rounded-full blur-[80px] pointer-events-none" />

      <div className="w-full max-w-sm relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-3xl bg-black mb-4 animate-float shadow-[0_0_40px_rgba(6,182,212,0.15)] overflow-hidden">
            <img src="/logo.png" alt="IronLog" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none' }} />
          </div>
          <p className="text-text-muted text-xs tracking-[0.25em] mt-2 font-medium">TRACK · PROGRESS · DOMINATE</p>
        </div>

        {/* Glass form card */}
        <div className="glass-strong rounded-3xl p-8 glow-soft animate-slide-up" style={{ animationDelay: '100ms' }}>
          <h2 className="text-lg font-bold mb-0.5">
            {mode === 'login' ? 'Bentornato' : mode === 'signup' ? 'Crea Account' : 'Recupera Password'}
          </h2>
          <p className="text-sm text-text-muted mb-7">
            {mode === 'login' ? 'Accedi al tuo profilo' : mode === 'signup' ? 'Inizia il tuo percorso' : 'Inserisci la tua email'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors duration-200" />
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="email@esempio.com" required
                className="w-full bg-white/4 border border-white/6 rounded-xl pl-10 pr-4 py-3.5 text-sm text-text-primary placeholder:text-text-muted/50 transition-all duration-200"
              />
            </div>

            {mode !== 'reset' && (
              <div className="relative group animate-fade-in">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors duration-200" />
                <input
                  type={showPw ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password" required minLength={6}
                  className="w-full bg-white/4 border border-white/6 rounded-xl pl-10 pr-10 py-3.5 text-sm text-text-primary placeholder:text-text-muted/50 transition-all duration-200"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors duration-200">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            )}

            {error && (
              <p className="text-xs text-danger bg-danger/8 border border-danger/12 rounded-xl px-3.5 py-2.5 animate-slide-down">{error}</p>
            )}
            {success && (
              <p className="text-xs text-success bg-success/8 border border-success/12 rounded-xl px-3.5 py-2.5 animate-slide-down">{success}</p>
            )}

            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>{mode === 'login' ? 'Accedi' : mode === 'signup' ? 'Registrati' : 'Invia Email'}<ArrowRight size={15} /></>
              )}
            </Button>
          </form>

          {mode !== 'reset' && (
            <>
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-white/6" />
                <span className="text-[9px] text-text-muted tracking-[0.25em] font-medium">OPPURE</span>
                <div className="flex-1 h-px bg-white/6" />
              </div>

              <Button variant="secondary" onClick={() => signInWithGoogle()} className="w-full">
                <svg width="15" height="15" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continua con Google
              </Button>
            </>
          )}

          <div className="mt-6 text-center space-y-2.5">
            {mode === 'login' && (
              <>
                <button onClick={() => setMode('reset')} className="block w-full text-xs text-text-muted hover:text-accent transition-colors duration-200">
                  Password dimenticata?
                </button>
                <button onClick={() => { setMode('signup'); setError('') }} className="block w-full text-xs text-text-muted hover:text-accent transition-colors duration-200">
                  Non hai un account? <span className="text-accent font-medium">Registrati</span>
                </button>
              </>
            )}
            {mode === 'signup' && (
              <button onClick={() => { setMode('login'); setError('') }} className="text-xs text-text-muted hover:text-accent transition-colors duration-200">
                Hai già un account? <span className="text-accent font-medium">Accedi</span>
              </button>
            )}
            {mode === 'reset' && (
              <button onClick={() => { setMode('login'); setError('') }} className="text-xs text-text-muted hover:text-accent transition-colors duration-200">
                ← Torna al login
              </button>
            )}
          </div>
        </div>

        <button onClick={handleSkip}
          className="w-full mt-6 text-xs text-text-muted/40 hover:text-text-muted transition-colors duration-200 text-center py-2">
          Continua senza account
        </button>
      </div>
    </div>
  )
}
