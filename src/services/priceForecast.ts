export type PricePoint = { date: string; priceTzs: number }
export type ForecastHorizon = 7 | 14 | 30
export type ForecastConfidence = 'low' | 'medium' | 'high'

export type PriceForecastResult = {
  status: 'ready' | 'insufficient'
  horizonDays: ForecastHorizon
  estimateTzs?: number
  lowerTzs?: number
  upperTzs?: number
  confidence?: ForecastConfidence
  explanation: string
  history: PricePoint[]
}

export interface PriceForecastProvider {
  forecast(points: PricePoint[], horizonDays: ForecastHorizon): PriceForecastResult
}

function variance(values: number[], mean: number): number {
  if (!values.length) return 0
  return values.reduce((total, value) => total + (value - mean) ** 2, 0) / values.length
}

export const localPriceForecastProvider: PriceForecastProvider = {
  forecast(points, horizonDays) {
    const history = [...points].filter((point) => Number.isFinite(point.priceTzs) && point.priceTzs > 0)
      .sort((left, right) => left.date.localeCompare(right.date))
    if (history.length < 4) {
      return {
        status: 'insufficient',
        horizonDays,
        explanation: 'Not enough data. At least four approved observations are needed before showing an estimate.',
        history,
      }
    }

    const firstTimestamp = new Date(`${history[0].date}T12:00:00`).getTime()
    const x = history.map((point) => (new Date(`${point.date}T12:00:00`).getTime() - firstTimestamp) / 86_400_000)
    const y = history.map((point) => point.priceTzs)
    const xMean = x.reduce((sum, value) => sum + value, 0) / x.length
    const yMean = y.reduce((sum, value) => sum + value, 0) / y.length
    const denominator = x.reduce((sum, value) => sum + (value - xMean) ** 2, 0)
    const slope = denominator === 0
      ? 0
      : x.reduce((sum, value, index) => sum + (value - xMean) * (y[index] - yMean), 0) / denominator
    const forecastDay = Math.max(...x) + horizonDays
    const regression = yMean + slope * (forecastDay - xMean)
    const recent = y.slice(-Math.min(5, y.length))
    const recentMean = recent.reduce((sum, value) => sum + value, 0) / recent.length
    const estimateTzs = Math.max(1, Math.round((regression * 0.6 + recentMean * 0.4) / 50) * 50)
    const spread = Math.sqrt(variance(y, yMean))
    const relativeVariance = yMean > 0 ? spread / yMean : 1
    const band = Math.max(yMean * (0.04 + relativeVariance * 0.5), 50) * Math.sqrt(horizonDays / 7)
    const confidence: ForecastConfidence = history.length >= 12 && relativeVariance < 0.12
      ? 'high'
      : history.length >= 7 && relativeVariance < 0.25
        ? 'medium'
        : 'low'
    return {
      status: 'ready',
      horizonDays,
      estimateTzs,
      lowerTzs: Math.max(1, Math.round((estimateTzs - band) / 50) * 50),
      upperTzs: Math.round((estimateTzs + band) / 50) * 50,
      confidence,
      explanation: `Estimate blends a simple price trend with the recent average from ${history.length} observations. Wider variation or fewer observations lowers confidence.`,
      history,
    }
  },
}

export const unconfiguredPriceForecastProvider: PriceForecastProvider = {
  forecast(points, horizonDays) {
    return {
      status: 'insufficient',
      horizonDays,
      explanation: 'A forecasting service is not configured. No external model was contacted.',
      history: points,
    }
  },
}
