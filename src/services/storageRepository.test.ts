import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LocalStorageRepository } from './storageRepository'

describe('LocalStorageRepository', () => {
  let repository: LocalStorageRepository

  beforeEach(() => {
    localStorage.clear()
    repository = new LocalStorageRepository()
  })

  it('reads the fallback when no value has been stored', () => {
    expect(repository.read('missing', ['fallback'])).toEqual(['fallback'])
  })

  it('round-trips structured values', () => {
    const value = { name: 'Avocado', priceTzs: 4500 }
    repository.write('product', value)
    expect(repository.read('product', null)).toEqual(value)
  })

  it('logs malformed stored JSON and returns the supplied fallback', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    localStorage.setItem('broken', '{')

    expect(repository.read('broken', 'safe fallback')).toBe('safe fallback')
    expect(errorSpy).toHaveBeenCalledOnce()
  })
})
