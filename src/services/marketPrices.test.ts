import { describe, expect, it } from 'vitest'
import { arushaMarkets, getApprovedPriceObservations, priceProducts, sampleMarketPrices } from './marketPrices'
import { priceReportSchema } from './priceReportSchema'

describe('market price sample data', () => {
  it('seeds at least twelve sample products across five Arusha markets with multiple dates', () => {
    expect(priceProducts.length).toBeGreaterThanOrEqual(12)
    expect(arushaMarkets.length).toBeGreaterThanOrEqual(5)
    expect(sampleMarketPrices.every((row) => row.source === 'sample' && row.status === 'approved')).toBe(true)
    expect(new Set(sampleMarketPrices.map((row) => row.productId)).size).toBeGreaterThanOrEqual(12)
    expect(new Set(sampleMarketPrices.map((row) => row.marketId)).size).toBeGreaterThanOrEqual(5)
    expect(new Set(sampleMarketPrices.map((row) => row.dateObserved)).size).toBeGreaterThanOrEqual(3)
  })

  it('only includes approved user reports alongside sample observations', () => {
    const report = { ...sampleMarketPrices[0], id: 'report', source: 'buyer report' as const }
    expect(getApprovedPriceObservations([{ ...report, status: 'pending' }])).not.toContainEqual(report)
    expect(getApprovedPriceObservations([{ ...report, status: 'approved' }])).toContainEqual({ ...report, status: 'approved' })
  })
})

describe('price report validation', () => {
  it('accepts a positive integer price and valid date', () => {
    expect(priceReportSchema.safeParse({
      productId: 'tomatoes',
      marketId: 'kilombero',
      priceTzs: 1500,
      dateObserved: '2026-11-09',
      note: 'Morning price',
    }).success).toBe(true)
  })

  it.each([0, -20, 10.5, Number.NaN])('rejects invalid price %s', (priceTzs) => {
    expect(priceReportSchema.safeParse({
      productId: 'tomatoes',
      marketId: 'kilombero',
      priceTzs,
      dateObserved: '2026-11-09',
    }).success).toBe(false)
  })

  it('rejects malformed dates and oversized notes', () => {
    expect(priceReportSchema.safeParse({ productId: 'tomatoes', marketId: 'kilombero', priceTzs: 1200, dateObserved: 'yesterday' }).success).toBe(false)
    expect(priceReportSchema.safeParse({ productId: 'tomatoes', marketId: 'kilombero', priceTzs: 1200, dateObserved: '2026-11-09', note: 'x'.repeat(241) }).success).toBe(false)
  })
})
