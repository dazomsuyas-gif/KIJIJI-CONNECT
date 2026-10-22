import type { SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const publishableKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  ?? import.meta.env.VITE_SUPABASE_ANON_KEY
)?.trim()

let client: Promise<SupabaseClient> | undefined

export function getSupabaseConfigurationError(): string | null {
  if (!supabaseUrl || !publishableKey) {
    return 'Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your local environment.'
  }

  try {
    const parsedUrl = new URL(supabaseUrl)
    if (!['http:', 'https:'].includes(parsedUrl.protocol) || !parsedUrl.hostname) {
      return 'VITE_SUPABASE_URL must be a valid HTTP or HTTPS project URL.'
    }
  } catch {
    return 'VITE_SUPABASE_URL must be a valid HTTP or HTTPS project URL.'
  }

  return null
}

export const isSupabaseConfigured = getSupabaseConfigurationError() === null

export function getSupabaseClient(): Promise<SupabaseClient> {
  const configurationError = getSupabaseConfigurationError()
  if (configurationError) {
    throw new Error(`Supabase is not configured. ${configurationError}`)
  }

  const projectUrl = supabaseUrl
  const publicKey = publishableKey
  if (!projectUrl || !publicKey) {
    throw new Error('Supabase project URL and publishable key are required.')
  }

  if (!client) {
    client = import('@supabase/supabase-js')
      .then(({ createClient }) => createClient(projectUrl, publicKey))
  }

  return client
}
