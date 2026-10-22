import type { Product } from './marketplaceCatalog'

export const localDemoSellerId = 'local-demo-seller'

export type LocalProductUpdate = {
  price: number
  stockQuantity: number
}

export function normalizeLocalListing(product: Product): Product {
  if (!product.isDemoUserListing || product.ownerId) return product
  return { ...product, ownerId: localDemoSellerId }
}

export function updateOwnedDemoProduct(
  products: Product[],
  actorId: string,
  productId: number,
  update: LocalProductUpdate,
): Product[] {
  const product = products.find((candidate) => candidate.id === productId)
  if (!product || !product.isDemoUserListing || product.ownerId !== actorId) {
    throw new Error('You can only update a demo listing owned by this local seller.')
  }
  if (!Number.isSafeInteger(update.price) || update.price < 1) {
    throw new Error('Price must be a positive whole number.')
  }
  if (!Number.isSafeInteger(update.stockQuantity) || update.stockQuantity < 0) {
    throw new Error('Stock quantity must be a whole number of zero or more.')
  }

  const stock = update.stockQuantity === 0
    ? 'Sample: Out of stock'
    : update.stockQuantity <= 5
      ? 'Sample: Low stock'
      : 'Sample: In stock'

  return products.map((candidate) => candidate.id === productId
    ? { ...candidate, price: update.price, stockQuantity: update.stockQuantity, stock }
    : candidate)
}

export function deleteOwnedDemoProduct(products: Product[], actorId: string, productId: number): Product[] {
  const product = products.find((candidate) => candidate.id === productId)
  if (!product || !product.isDemoUserListing || product.ownerId !== actorId) {
    throw new Error('You can only remove a demo listing owned by this local seller.')
  }
  return products.filter((candidate) => candidate.id !== productId)
}
