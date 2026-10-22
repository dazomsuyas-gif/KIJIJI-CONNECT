import { describe, expect, it } from 'vitest'
import { catalogueLastUpdated, marketplaceCategories, productsSeed } from './marketplaceCatalog'

describe('illustrative marketplace catalogue', () => {
  it('contains at least 40 uniquely identified sample listings across the marketplace categories', () => {
    expect(productsSeed.length).toBeGreaterThanOrEqual(40)
    expect(new Set(productsSeed.map((product) => product.id)).size).toBe(productsSeed.length)
    expect(new Set(productsSeed.map((product) => product.category))).toEqual(
      new Set(marketplaceCategories.slice(1)),
    )
    expect(productsSeed.every((product) => product.price > 0 && product.wholesalePrice > 0)).toBe(true)
  })

  it('publishes an explicit date for the sample catalogue', () => {
    expect(catalogueLastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
