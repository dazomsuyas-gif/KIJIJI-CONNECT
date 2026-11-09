import { arushaMarkets, priceProducts } from './priceCatalog'

export { arushaMarkets, priceProducts } from './priceCatalog'
export type { ArushaMarket, PriceProduct } from './priceCatalog'

export type MarketPriceSource = 'sample' | 'seller report' | 'buyer report'
export type MarketPriceStatus = 'pending' | 'approved' | 'rejected'

export type MarketPriceObservation = {
  id: string
  productId: string
  marketId: string
  unit: string
  priceTzs: number
  dateObserved: string
  source: MarketPriceSource
  status: MarketPriceStatus
  note?: string
}

const marketFactors: Record<string, number> = {
  kilombero: 0.94,
  central: 1.02,
  'soko-kuu': 0.98,
  shoprite: 1.24,
  njiro: 1.16,
  'soko-mjinga': 0.92,
  'local-wholesalers': 0.88,
}

const basePrices: Record<string, number> = {
  tomatoes: 1800,
  onions: 2400,
  bananas: 6500,
  potatoes: 1700,
  maize: 1500,
  rice: 3200,
  beans: 2800,
  cement: 18500,
  'roofing-sheet': 28000,
  'cooking-oil': 7000,
  detergent: 6500,
  'usb-charger': 18000,
}

const dateOffsets = [35, 28, 21, 14, 7, 0]
const dateAtOffset = (daysAgo: number) => {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString().slice(0, 10)
}

export const lastUpdated = new Date().toISOString()

export const sampleMarketPrices: MarketPriceObservation[] = priceProducts.flatMap((product) =>
  arushaMarkets.flatMap((market, marketIndex) =>
    dateOffsets.map((offset, dateIndex) => {
      const trend = 1 + (dateOffsets.length - dateIndex - 1) * ((marketIndex % 3) - 1) * 0.009
      const priceTzs = Math.round(basePrices[product.id] * marketFactors[market.id] * trend / 50) * 50
      return {
        id: `sample-${product.id}-${market.id}-${dateIndex}`,
        productId: product.id,
        marketId: market.id,
        unit: product.unit,
        priceTzs,
        dateObserved: dateAtOffset(offset),
        source: 'sample' as const,
        status: 'approved' as const,
      }
    }),
  ),
)

export function getApprovedPriceObservations(reports: MarketPriceObservation[] = []): MarketPriceObservation[] {
  return [...sampleMarketPrices, ...reports.filter((report) => report.status === 'approved')]
}
