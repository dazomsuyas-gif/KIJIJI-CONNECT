import { describe, expect, it } from 'vitest'
import {
  appRoutes,
  getRouteForPath,
  getRouteForSection,
  getRouteForTarget,
} from './routes'

describe('application routes', () => {
  it('defines unique paths and section targets', () => {
    expect(new Set(appRoutes.map((route) => route.path)).size).toBe(appRoutes.length)
    expect(new Set(appRoutes.map((route) => route.sectionId)).size).toBe(appRoutes.length)
  })

  it.each(appRoutes)('resolves $path to its page section', (route) => {
    expect(getRouteForPath(route.path)).toEqual(route)
    expect(getRouteForSection(route.sectionId)).toEqual(route)
  })

  it('maps embedded marketplace and travel actions to their owning pages', () => {
    expect(getRouteForTarget('catalog-search')?.page).toBe('marketplace')
    expect(getRouteForTarget('product-name')?.page).toBe('marketplace')
    expect(getRouteForTarget('travel-enquiry-form')?.page).toBe('travel')
  })

  it('does not resolve unknown paths or targets', () => {
    expect(getRouteForPath('/private-admin')).toBeUndefined()
    expect(getRouteForTarget('missing-section')).toBeUndefined()
  })
})
