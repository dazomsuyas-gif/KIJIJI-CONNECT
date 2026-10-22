import { describe, expect, it } from 'vitest'
import { resolveDemoAssistantIntent } from './demoAssistant'

describe('local assistant marketplace routing', () => {
  it('searches product requests instead of treating every “find” request as travel', () => {
    expect(resolveDemoAssistantIntent('Find avocado products')).toEqual({
      type: 'search',
      query: 'avocado',
    })
  })

  it('continues to route hotel requests to travel planning', () => {
    expect(resolveDemoAssistantIntent('Find a hotel in Arusha for 2 nights')).toEqual({
      type: 'navigate',
      section: 'travel-booking',
    })
  })

  it('parses safe product price and stock proposals without applying them', () => {
    expect(resolveDemoAssistantIntent('Set price of Fresh Avocado to 4,500 TZS')).toEqual({
      type: 'set-price',
      productQuery: 'Fresh Avocado',
      price: 4500,
    })
    expect(resolveDemoAssistantIntent('Reduce cement stock to 20 bags')).toEqual({
      type: 'set-stock',
      productQuery: 'cement',
      stockQuantity: 20,
    })
    expect(resolveDemoAssistantIntent('Set stock of cement to 20 bags')).toEqual({
      type: 'set-stock',
      productQuery: 'cement',
      stockQuantity: 20,
    })
    expect(resolveDemoAssistantIntent('Set price of maize to zero')).toEqual({ type: 'help' })
  })

  it('parses an order request as a quantity-bearing draft proposal', () => {
    expect(resolveDemoAssistantIntent('Order 50kg avocado')).toEqual({
      type: 'order-draft',
      productQuery: 'avocado',
      quantity: 50,
      unit: 'kg',
    })
  })
})
