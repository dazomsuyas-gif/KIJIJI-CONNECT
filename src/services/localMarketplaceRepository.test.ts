import { describe, expect, it } from 'vitest'
import { productsSeed } from './marketplaceCatalog'
import {
  deleteOwnedDemoProduct,
  localDemoSellerId,
  normalizeLocalListing,
  updateOwnedDemoProduct,
} from './localMarketplaceRepository'

const localListing = normalizeLocalListing({
  ...productsSeed[0],
  id: 9001,
  isDemoUserListing: true,
})

describe('local marketplace repository', () => {
  it('normalizes older browser-local listings to the local demo owner', () => {
    expect(localListing.ownerId).toBe(localDemoSellerId)
    expect(normalizeLocalListing(productsSeed[0])).toEqual(productsSeed[0])
  })

  it('updates price and stock only for the owning local demo seller', () => {
    const products = updateOwnedDemoProduct([localListing], localDemoSellerId, localListing.id, {
      price: 4500,
      stockQuantity: 5,
    })

    expect(products[0]).toMatchObject({ price: 4500, stockQuantity: 5, stock: 'Sample: Low stock' })
    expect(() => updateOwnedDemoProduct([localListing], 'another-user', localListing.id, {
      price: 4500,
      stockQuantity: 5,
    })).toThrow('You can only update a demo listing owned by this local seller.')
    expect(() => updateOwnedDemoProduct(productsSeed, localDemoSellerId, productsSeed[0].id, {
      price: 4500,
      stockQuantity: 5,
    })).toThrow('You can only update a demo listing owned by this local seller.')
  })

  it('rejects invalid values and removes only an owned local listing', () => {
    expect(() => updateOwnedDemoProduct([localListing], localDemoSellerId, localListing.id, {
      price: 0,
      stockQuantity: 4,
    })).toThrow('Price must be a positive whole number.')
    expect(() => updateOwnedDemoProduct([localListing], localDemoSellerId, localListing.id, {
      price: 100,
      stockQuantity: -1,
    })).toThrow('Stock quantity must be a whole number of zero or more.')
    expect(deleteOwnedDemoProduct([localListing, productsSeed[0]], localDemoSellerId, localListing.id))
      .toEqual([productsSeed[0]])
    expect(() => deleteOwnedDemoProduct([productsSeed[0]], localDemoSellerId, productsSeed[0].id))
      .toThrow('You can only remove a demo listing owned by this local seller.')
  })
})
