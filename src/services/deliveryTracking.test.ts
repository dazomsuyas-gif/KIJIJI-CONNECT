import { describe, expect, it } from 'vitest'
import { arushaDeliveryPlaces, deliveryStatusIndex, deliveryStatusLabel } from './deliveryTracking'

describe('Arusha delivery tracking', () => {
  it('covers named delivery places with coordinates', () => {
    expect(arushaDeliveryPlaces.length).toBeGreaterThanOrEqual(8)
    expect(arushaDeliveryPlaces.every((place) => Number.isFinite(place.latitude) && Number.isFinite(place.longitude))).toBe(true)
  })

  it('orders sender and receiver delivery states', () => {
    expect(deliveryStatusIndex('pending-sender')).toBeLessThan(deliveryStatusIndex('sent'))
    expect(deliveryStatusIndex('sent')).toBeLessThan(deliveryStatusIndex('delivered'))
    expect(deliveryStatusLabel('accepted')).toBe('Accepted by sender')
  })
})
