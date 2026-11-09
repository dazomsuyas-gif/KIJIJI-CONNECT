export type ArushaMarket = {
  id: string
  name: string
  area: string
  type: 'market' | 'supermarket' | 'wholesaler'
}

export type PriceProduct = {
  id: string
  name: string
  category: string
  unit: string
}

export const arushaMarkets: ArushaMarket[] = [
  { id: 'kilombero', name: 'Kilombero Market', area: 'Levolosi', type: 'market' },
  { id: 'central', name: 'Arusha Central Market', area: 'City Centre', type: 'market' },
  { id: 'soko-kuu', name: 'Soko Kuu', area: 'City Centre', type: 'market' },
  { id: 'shoprite', name: 'Shoprite Arusha', area: 'Sokoine Road', type: 'supermarket' },
  { id: 'njiro', name: 'Njiro supermarkets', area: 'Njiro', type: 'supermarket' },
  { id: 'soko-mjinga', name: 'Soko Mjinga', area: 'Sakina', type: 'market' },
  { id: 'local-wholesalers', name: 'Arusha local wholesalers', area: 'Industrial area', type: 'wholesaler' },
]

export const priceProducts: PriceProduct[] = [
  { id: 'tomatoes', name: 'Tomatoes', category: 'Produce', unit: 'kg' },
  { id: 'onions', name: 'Red onions', category: 'Produce', unit: 'kg' },
  { id: 'bananas', name: 'Cooking bananas', category: 'Produce', unit: 'bunch' },
  { id: 'potatoes', name: 'Irish potatoes', category: 'Produce', unit: 'kg' },
  { id: 'maize', name: 'Maize grain', category: 'Grains', unit: 'kg' },
  { id: 'rice', name: 'Rice', category: 'Grains', unit: 'kg' },
  { id: 'beans', name: 'Dry beans', category: 'Grains', unit: 'kg' },
  { id: 'cement', name: 'Portland cement', category: 'Building materials', unit: '50 kg bag' },
  { id: 'roofing-sheet', name: 'Corrugated roofing sheet', category: 'Building materials', unit: 'sheet' },
  { id: 'cooking-oil', name: 'Cooking oil', category: 'Household goods', unit: 'litre' },
  { id: 'detergent', name: 'Laundry detergent', category: 'Household goods', unit: 'kg' },
  { id: 'usb-charger', name: 'USB-C phone charger', category: 'Electronics', unit: 'piece' },
]

export function matchPriceProduct(productName: string): PriceProduct | undefined {
  const normalized = productName.toLowerCase()
  const matches: Record<string, string[]> = {
    tomatoes: ['tomato'],
    onions: ['onion'],
    bananas: ['banana'],
    potatoes: ['potato'],
    maize: ['maize'],
    rice: ['rice'],
    beans: ['bean'],
    cement: ['cement'],
    'roofing-sheet': ['roofing sheet', 'roof sheet'],
    'cooking-oil': ['cooking oil'],
    detergent: ['detergent'],
    'usb-charger': ['charger', 'usb-c'],
  }
  return priceProducts.find((product) => matches[product.id]?.some((term) => normalized.includes(term)))
}

export function resolvePriceProductQuery(query: string): PriceProduct | undefined {
  const normalized = query.toLowerCase().trim()
  const aliases: Record<string, string[]> = {
    tomatoes: ['nyanya'],
    onions: ['vitunguu', 'kitunguu'],
    bananas: ['ndizi'],
    potatoes: ['viazi'],
    maize: ['mahindi'],
    rice: ['mchele'],
    beans: ['maharage', 'maharagwe'],
    cement: ['saruji'],
    'cooking-oil': ['mafuta ya kupikia', 'mafuta'],
  }
  return priceProducts.find((product) => product.id === normalized || product.name.toLowerCase().includes(normalized))
    ?? priceProducts.find((product) => aliases[product.id]?.some((alias) => normalized.includes(alias)))
}
