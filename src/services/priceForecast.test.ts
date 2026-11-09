import { describe, expect, it } from 'vitest'
import { localPriceForecastProvider, unconfiguredPriceForecastProvider, type PricePoint } from './priceForecast'

const points: PricePoint[] = [
  { date: '2026-10-01', priceTzs: 1000 },
  { date: '2026-10-08', priceTzs: 1050 },
  { date: '2026-10-15', priceTzs: 1100 },
  { date: '2026-10-22', priceTzs: 1150 },
  { date: '2026-10-29', priceTzs: 1200 },
]

describe('local price forecast', () => {
  it('requires at least four valid observations', () => {
    expect(localPriceForecastProvider.forecast([], 7).status).toBe('insufficient')
    expect(localPriceForecastProvider.forecast(points.slice(0, 1), 7).explanation).toContain('Not enough data')
    expect(localPriceForecastProvider.forecast(points.slice(0, 3), 7).status).toBe('insufficient')
  })

  it('returns a plausible trend, range, and confidence for an upward series', () => {
    const forecast = localPriceForecastProvider.forecast(points, 7)
    expect(forecast.status).toBe('ready')
    expect(forecast.estimateTzs).toBeGreaterThanOrEqual(1200)
    expect(forecast.lowerTzs).toBeLessThan(forecast.estimateTzs ?? 0)
    expect(forecast.upperTzs).toBeGreaterThan(forecast.estimateTzs ?? 0)
    expect(forecast.confidence).toBe('low')
  })

  it('bounds estimates for outliers and sorts history by date', () => {
    const forecast = localPriceForecastProvider.forecast([
      { date: '2026-10-30', priceTzs: 5000 },
      { date: '2026-10-01', priceTzs: 1000 },
      { date: '2026-10-15', priceTzs: 1050 },
      { date: '2026-10-22', priceTzs: 1100 },
      { date: '2026-10-08', priceTzs: 980 },
    ], 14)
    expect(forecast.status).toBe('ready')
    expect(forecast.history[0].date).toBe('2026-10-01')
    expect(forecast.estimateTzs).toBeGreaterThan(0)
    expect(forecast.upperTzs).toBeGreaterThan(forecast.lowerTzs ?? 0)
  })

  it('reports an external forecast adapter as not configured', () => {
    const result = unconfiguredPriceForecastProvider.forecast(points, 30)
    expect(result.status).toBe('insufficient')
    expect(result.explanation).toContain('not configured')
  })
})
