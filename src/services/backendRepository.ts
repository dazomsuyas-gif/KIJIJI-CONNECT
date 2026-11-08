import { getSupabaseConfigurationError, isSupabaseConfigured } from './supabaseClient'

export type BackendCapability =
  | 'authentication'
  | 'marketplace'
  | 'orders'
  | 'learning-progress'
  | 'travel-enquiries'
  | 'notifications'

export type BackendResult<T> =
  | { ok: true; value: T }
  | { ok: false; code: 'not-configured' | 'not-implemented'; message: string }

export interface BackendRepository {
  readonly mode: 'supabase' | 'not-configured'
  supports(capability: BackendCapability): boolean
  unavailable<T>(capability: BackendCapability): BackendResult<T>
}

class SafeBackendRepository implements BackendRepository {
  readonly mode = isSupabaseConfigured ? 'supabase' : 'not-configured' as const

  supports(capability: BackendCapability): boolean {
    return this.mode === 'supabase' && capability === 'authentication'
  }

  unavailable<T>(capability: BackendCapability): BackendResult<T> {
    const configurationError = getSupabaseConfigurationError()
    if (configurationError) {
      return {
        ok: false,
        code: 'not-configured',
        message: `${capability} is not connected to a shared backend. ${configurationError}`,
      }
    }

    return {
      ok: false,
      code: 'not-implemented',
      message: `${capability} has a typed backend boundary but no provider operation is enabled yet.`,
    }
  }
}

export const backendRepository: BackendRepository = new SafeBackendRepository()
