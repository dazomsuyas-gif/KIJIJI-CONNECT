import { useEffect, useState, type FormEvent } from 'react'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import {
  getSupabaseClient,
  getSupabaseConfigurationError,
  isSupabaseConfigured,
} from '../services/supabaseClient'

type AuthMode = 'sign-in' | 'sign-up' | 'recovery' | 'update-password'

const authModeLabels: Record<AuthMode, string> = {
  'sign-in': 'Sign in',
  'sign-up': 'Create account',
  recovery: 'Send password recovery email',
  'update-password': 'Save new password',
}

export function SupabaseAuthPanel() {
  const [user, setUser] = useState<User | null>(null)
  const [recoverySession, setRecoverySession] = useState(false)
  const [mode, setMode] = useState<AuthMode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loadingSession, setLoadingSession] = useState(isSupabaseConfigured)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const configurationError = getSupabaseConfigurationError()

  useEffect(() => {
    if (!isSupabaseConfigured) return

    let active = true
    let subscription: ReturnType<SupabaseClient['auth']['onAuthStateChange']>['data']['subscription'] | undefined

    const initializeAuth = async () => {
      try {
        const supabase = await getSupabaseClient()
        if (!active) return

        const result = supabase.auth.onAuthStateChange((event, session) => {
          if (!active) return
          setUser(session?.user ?? null)
          if (event === 'PASSWORD_RECOVERY') {
            setRecoverySession(true)
            setMode('update-password')
            setFeedback('Choose a new password for your account.')
          }
        })
        subscription = result.data.subscription

        const { data, error } = await supabase.auth.getSession()
        if (!active) return
        if (error) {
          setErrorMessage(`Could not check your sign-in status: ${error.message}`)
          return
        }
        setUser(data.session?.user ?? null)
      } catch (error) {
        if (active) {
          setErrorMessage(error instanceof Error ? error.message : 'Could not connect to Supabase Auth.')
        }
      } finally {
        if (active) setLoadingSession(false)
      }
    }
    void initializeAuth()

    return () => {
      active = false
      subscription?.unsubscribe()
    }
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setFeedback('')

    if (!isSupabaseConfigured) {
      setErrorMessage(`Supabase is not configured. ${configurationError} Follow SETUP_GUIDE.md to configure .env.local.`)
      return
    }

    setSubmitting(true)
    try {
      const supabase = await getSupabaseClient()
      if (mode === 'update-password') {
        const { error } = await supabase.auth.updateUser({ password })
        if (error) throw error
        setRecoverySession(false)
        setPassword('')
        setMode('sign-in')
        setFeedback('Your password was updated.')
      } else if (mode === 'sign-up') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin },
        })
        if (error) throw error
        setUser(data.session?.user ?? null)
        setFeedback(data.session
          ? 'Your account is created and signed in. Email confirmation may still be required by the project settings.'
          : 'Sign-up submitted. Check your email for a confirmation link before signing in.')
      } else if (mode === 'recovery') {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: window.location.origin,
        })
        if (error) throw error
        setFeedback('If an account exists for that address, Supabase will send a password recovery email.')
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        if (error) throw error
        setUser(data.user)
        setFeedback('You are signed in. This confirms authentication only; no marketplace roles or administrator permissions are configured.')
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'The authentication request failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSignOut = async () => {
    setSubmitting(true)
    setErrorMessage('')
    setFeedback('')
    try {
      const supabase = await getSupabaseClient()
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setFeedback('You have signed out.')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not sign out. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <article className="phase-card auth-panel">
        <span className="badge badge--gold">Setup required</span>
        <h3>Connect Supabase to enable account sign-in</h3>
        <p>Authentication is not active yet. {configurationError} Add your project URL and public publishable/anon key to a local <code>.env.local</code> file, following SETUP_GUIDE.md.</p>
        <p className="auth-security-note">Never use a service-role key in this browser app. Sign-in alone does not grant seller or administrator access; database policies and trusted role assignment must be configured separately.</p>
      </article>
    )
  }

  if (loadingSession) {
    return <article className="phase-card auth-panel" role="status">Checking Supabase sign-in status…</article>
  }

  if (user && !recoverySession) {
    return (
      <article className="phase-card account-summary auth-panel">
        <div className="profile-avatar" aria-hidden="true">{(user.email?.[0] ?? 'U').toUpperCase()}</div>
        <div className="auth-panel__identity">
          <span className="badge badge--green">Signed in</span>
          <h3>{user.email}</h3>
          <p>Authentication is active for this account.</p>
          <small>No marketplace profile, seller status, or administrator permission is implied by sign-in.</small>
          {errorMessage && <p className="storage-error" role="alert">{errorMessage}</p>}
          {feedback && <p className="auth-feedback" role="status">{feedback}</p>}
          <button type="button" className="secondary-button" onClick={handleSignOut} disabled={submitting}>
            {submitting ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </article>
    )
  }

  return (
    <article className="phase-card auth-panel">
      <span className="badge badge--green">Supabase Auth</span>
      <h3>{authModeLabels[mode]}</h3>
      <p>Use your email to access authentication. Account roles and private marketplace data are not enabled until database policies are implemented.</p>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>Email address
          <input
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        {mode !== 'recovery' && (
          <label>Password
            <input
              type="password"
              autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
        )}
        {errorMessage && <p className="storage-error" role="alert">{errorMessage}</p>}
        {feedback && <p className="auth-feedback" role="status">{feedback}</p>}
        <button type="submit" className="primary-button" disabled={submitting}>
          {submitting ? 'Please wait…' : authModeLabels[mode]}
        </button>
      </form>
      <div className="auth-mode-actions" aria-label="Account options">
        {mode !== 'sign-in' && mode !== 'update-password' && <button type="button" className="ghost-button small" onClick={() => { setMode('sign-in'); setFeedback(''); setErrorMessage('') }}>Sign in</button>}
        {mode !== 'sign-up' && mode !== 'update-password' && <button type="button" className="ghost-button small" onClick={() => { setMode('sign-up'); setFeedback(''); setErrorMessage('') }}>Create account</button>}
        {mode !== 'recovery' && mode !== 'update-password' && <button type="button" className="ghost-button small" onClick={() => { setMode('recovery'); setFeedback(''); setErrorMessage('') }}>Forgot password?</button>}
      </div>
    </article>
  )
}
