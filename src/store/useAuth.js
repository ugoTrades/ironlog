import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

export const useAuth = create((set, get) => ({
  user: null,
  session: null,
  loading: true,

  initialize: async () => {
    if (!supabase) {
      set({ loading: false })
      return
    }
    const { data: { session } } = await supabase.auth.getSession()
    set({ session, user: session?.user ?? null, loading: false })

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null })
    })
  },

  signUp: async (email, password, metadata = {}) => {
    if (!supabase) return { error: { message: 'Supabase non configurato' } }
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (!error && data.user) set({ user: data.user, session: data.session })
    return { data, error }
  },

  signIn: async (email, password) => {
    if (!supabase) return { error: { message: 'Supabase non configurato' } }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error) set({ user: data.user, session: data.session })
    return { data, error }
  },

  signInWithGoogle: async () => {
    if (!supabase) return { error: { message: 'Supabase non configurato' } }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    return { data, error }
  },

  signInWithApple: async () => {
    if (!supabase) return { error: { message: 'Supabase non configurato' } }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    return { data, error }
  },

  signOut: async () => {
    if (supabase) await supabase.auth.signOut()
    set({ user: null, session: null })
  },

  resetPassword: async (email) => {
    if (!supabase) return { error: { message: 'Supabase non configurato' } }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    })
    return { error }
  },
}))
