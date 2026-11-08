import { describe, expect, it } from 'vitest'
import { backendRepository } from './backendRepository'

describe('backend repository boundary', () => {
  it('does not claim shared data capabilities when provider configuration is absent', () => {
    expect(backendRepository.mode).toBe('not-configured')
    expect(backendRepository.supports('marketplace')).toBe(false)
    expect(backendRepository.unavailable('marketplace')).toMatchObject({
      ok: false,
      code: 'not-configured',
    })
  })
})
