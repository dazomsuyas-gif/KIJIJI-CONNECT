export type ProductAudience = 'B2B' | 'B2C'

export type Product = {
  id: number
  name: string
  category: string
  description: string
  price: number
  wholesalePrice: number
  minimumWholesaleQty: number
  unit: string
  location: string
  seller: string
  audience: ProductAudience[]
  stock: string
  image: string
  isDemoUserListing?: boolean
  ownerId?: string
  stockQuantity?: number
}

export const marketplaceCategories = [
  'All categories',
  'Agricultural products',
  'Food & beverages',
  'Construction materials',
  'Electronics',
  'Household goods',
  'Clothing & fashion',
  'Furniture',
  'Personal care',
  'Office supplies',
  'Tourism products',
  'Other merchandise',
]

export const sampleAvailability = [
  'Sample: In stock',
  'Sample: Low stock',
  'Sample: Preorder',
]

const categoryDefaults: Record<string, {
  description: string
  wholesaleRate: number
  minimumWholesaleQty: number
  unit: string
  audience: ProductAudience[]
  image: string
}> = {
  'Agricultural products': {
    description: 'Illustrative local produce listing. Confirm grade, quantity and current price with the seller.',
    wholesaleRate: 0.76,
    minimumWholesaleQty: 25,
    unit: 'kg',
    audience: ['B2B', 'B2C'],
    image: '/fresh-produce.jpg',
  },
  'Food & beverages': {
    description: 'Illustrative food product listing. Ingredients, packaging and availability require seller confirmation.',
    wholesaleRate: 0.78,
    minimumWholesaleQty: 20,
    unit: 'pack',
    audience: ['B2B', 'B2C'],
    image: '/fresh-produce.jpg',
  },
  'Construction materials': {
    description: 'Illustrative construction supply listing. Confirm specifications, delivery and current price with the seller.',
    wholesaleRate: 0.88,
    minimumWholesaleQty: 10,
    unit: 'piece',
    audience: ['B2B', 'B2C'],
    image: '/kijiji-construction-art.svg',
  },
  Electronics: {
    description: 'Illustrative electronics listing. Confirm product specifications, warranty and availability with the seller.',
    wholesaleRate: 0.82,
    minimumWholesaleQty: 10,
    unit: 'piece',
    audience: ['B2B', 'B2C'],
    image: '/kijiji-electronics-art.svg',
  },
  'Household goods': {
    description: 'Illustrative household goods listing. Confirm materials, dimensions and availability with the seller.',
    wholesaleRate: 0.8,
    minimumWholesaleQty: 10,
    unit: 'piece',
    audience: ['B2B', 'B2C'],
    image: '/kijiji-product-art.svg',
  },
  'Clothing & fashion': {
    description: 'Illustrative clothing listing. Confirm sizes, materials, colour options and availability with the seller.',
    wholesaleRate: 0.75,
    minimumWholesaleQty: 12,
    unit: 'piece',
    audience: ['B2B', 'B2C'],
    image: '/kijiji-product-art.svg',
  },
  Furniture: {
    description: 'Illustrative furniture listing. Confirm dimensions, materials, delivery and availability with the seller.',
    wholesaleRate: 0.84,
    minimumWholesaleQty: 3,
    unit: 'piece',
    audience: ['B2B', 'B2C'],
    image: '/kijiji-product-art.svg',
  },
  'Personal care': {
    description: 'Illustrative personal care listing. Confirm ingredients, packaging and seller details before purchase.',
    wholesaleRate: 0.78,
    minimumWholesaleQty: 12,
    unit: 'piece',
    audience: ['B2C'],
    image: '/kijiji-product-art.svg',
  },
  'Office supplies': {
    description: 'Illustrative office supply listing. Confirm specifications, order quantities and availability with the seller.',
    wholesaleRate: 0.82,
    minimumWholesaleQty: 5,
    unit: 'piece',
    audience: ['B2B'],
    image: '/kijiji-product-art.svg',
  },
  'Tourism products': {
    description: 'Illustrative tourism product listing. Confirm contents, provider details and availability before purchase.',
    wholesaleRate: 0.8,
    minimumWholesaleQty: 10,
    unit: 'piece',
    audience: ['B2B', 'B2C'],
    image: '/kijiji-travel-art.svg',
  },
  'Other merchandise': {
    description: 'Illustrative marketplace listing. Confirm product details, seller information and availability before purchase.',
    wholesaleRate: 0.8,
    minimumWholesaleQty: 10,
    unit: 'piece',
    audience: ['B2B', 'B2C'],
    image: '/kijiji-product-art.svg',
  },
}

const sampleRecords: Array<[string, string, string, string, number, string?]> = [
  ['Kilimanjaro Coffee Beans', 'Agricultural products', 'Moshi', 'Kilimanjaro Sample Growers', 24000, 'kg'],
  ['Red Kidney Beans', 'Agricultural products', 'Karatu', 'Highland Sample Produce', 5200, 'kg'],
  ['Yellow Maize Grain', 'Agricultural products', 'Babati', 'Manyara Sample Harvest', 1900, 'kg'],
  ['Arabica Green Coffee', 'Agricultural products', 'Hai', 'Northern Sample Coffee', 18500, 'kg'],
  ['Fresh Sweet Bananas', 'Agricultural products', 'Usa River', 'Meru Sample Farms', 2300, 'bunch'],
  ['Sunflower Seeds', 'Agricultural products', 'Singida', 'Central Sample Oilseeds', 3400, 'kg'],
  ['Raw Forest Honey', 'Food & beverages', 'Arusha', 'Maji Moto Sample Apiary', 16000, 'jar'],
  ['Dried Mango Slices', 'Food & beverages', 'Moshi', 'Rift Valley Sample Foods', 7500, 'pack'],
  ['Chilli Pepper Sauce', 'Food & beverages', 'Njiro', 'Amani Sample Kitchen', 6200, 'bottle'],
  ['Whole Grain Millet Flour', 'Food & beverages', 'Babati', 'Manyara Sample Milling', 4800, 'kg'],
  ['Portland Cement Sample Bag', 'Construction materials', 'Arusha', 'BuildPro Sample Depot', 28500, 'bag'],
  ['Roofing Sheet Sample', 'Construction materials', 'Moshi Road', 'Northline Sample Metals', 32000, 'sheet'],
  ['Interior Paint Sample Tin', 'Construction materials', 'Arusha', 'ColourHouse Sample Supply', 38000, 'tin'],
  ['Solar Home Light Kit', 'Electronics', 'Arusha', 'VoltEast Sample Traders', 68000, 'kit'],
  ['USB-C Power Adapter', 'Electronics', 'Moshi', 'Circuit Sample Shop', 22000, 'piece'],
  ['Rechargeable Radio', 'Electronics', 'Njiro', 'Kibo Sample Electronics', 45000, 'piece'],
  ['Stainless Steel Water Bottle', 'Household goods', 'Arusha', 'HomeBasics Sample Store', 18000, 'piece'],
  ['Woven Storage Basket', 'Household goods', 'Mto wa Mbu', 'Handcraft Sample Collective', 26000, 'piece'],
  ['Reusable Food Container Set', 'Household goods', 'Moshi', 'Moshi Sample Homeware', 14500, 'set'],
  ['Cotton Kanga Fabric', 'Clothing & fashion', 'Arusha', 'Kitenge Sample Textiles', 12000, 'piece'],
  ['Unisex Cotton T-Shirt', 'Clothing & fashion', 'Moshi', 'Urban Sample Apparel', 18000, 'piece'],
  ['Handwoven Market Tote', 'Clothing & fashion', 'Arusha', 'Kijiji Sample Craftworks', 22000, 'piece'],
  ['Solid Wood Dining Chair', 'Furniture', 'Arusha', 'Mlimani Sample Workshop', 145000, 'piece'],
  ['Compact Study Desk', 'Furniture', 'Moshi', 'North Ridge Sample Furniture', 280000, 'piece'],
  ['Wooden Bookshelf', 'Furniture', 'Njiro', 'Mlimani Sample Workshop', 195000, 'piece'],
  ['Shea Body Butter', 'Personal care', 'Arusha', 'Asili Sample Naturals', 14000, 'jar'],
  ['Herbal Soap Sample Bar', 'Personal care', 'Moshi', 'GreenLeaf Sample Care', 4500, 'bar'],
  ['Refillable Hand Wash', 'Personal care', 'Arusha', 'Asili Sample Naturals', 8500, 'bottle'],
  ['A4 Copier Paper Ream', 'Office supplies', 'Arusha', 'Urban Workspace Sample', 18500, 'ream'],
  ['Classroom Exercise Books', 'Office supplies', 'Moshi', 'Learning Supply Sample Co.', 1200, 'book'],
  ['Desktop Document Organizer', 'Office supplies', 'Njiro', 'Urban Workspace Sample', 28000, 'piece'],
  ['Reusable Safari Water Bottle', 'Tourism products', 'Arusha', 'Serengeti Trail Sample Goods', 18000, 'piece'],
  ['Canvas Daypack', 'Tourism products', 'Moshi', 'Kibo Trail Sample Outfitters', 68000, 'piece'],
  ['Illustrated Tanzania Field Guide', 'Tourism products', 'Arusha', 'Northern Routes Sample Press', 24000, 'book'],
  ['Reusable Market Shopping Bag', 'Other merchandise', 'Arusha', 'Kijiji Sample Goods', 6500, 'piece'],
]

const generatedSamples: Product[] = sampleRecords.map((record, index) => {
  const [name, category, location, seller, price, unit] = record
  const defaults = categoryDefaults[category]
  return {
    id: index + 7,
    name,
    category,
    description: defaults.description,
    price,
    wholesalePrice: Math.round(price * defaults.wholesaleRate),
    minimumWholesaleQty: defaults.minimumWholesaleQty,
    unit: unit ?? defaults.unit,
    location,
    seller,
    audience: defaults.audience,
    stock: sampleAvailability[index % sampleAvailability.length],
    image: defaults.image,
  }
})

const originalSamples: Product[] = [
  {
    id: 1,
    name: 'Fresh Avocado Grade A',
    category: 'Agricultural products',
    description: 'Illustrative export-grade avocado listing. Confirm grade, quantity and current price with the seller.',
    price: 4200,
    wholesalePrice: 3200,
    minimumWholesaleQty: 30,
    unit: 'kg',
    location: 'Arusha Urban',
    seller: 'Green Valley Farms (sample)',
    audience: ['B2B', 'B2C'],
    stock: 'Sample: In stock',
    image: '/fresh-produce.jpg',
  },
  {
    id: 2,
    name: 'Cement 50kg Premium',
    category: 'Construction materials',
    description: 'Illustrative cement listing. Confirm specifications, delivery and current price with the seller.',
    price: 28000,
    wholesalePrice: 24500,
    minimumWholesaleQty: 10,
    unit: 'bag',
    location: 'Moshi Road',
    seller: 'BuildPro Supplies (sample)',
    audience: ['B2B', 'B2C'],
    stock: 'Sample: Low stock',
    image: '/kijiji-construction-art.svg',
  },
  {
    id: 3,
    name: 'Solar Rechargeable Lantern',
    category: 'Electronics',
    description: 'Illustrative rechargeable lighting listing. Confirm specifications and availability with the seller.',
    price: 26000,
    wholesalePrice: 21000,
    minimumWholesaleQty: 25,
    unit: 'piece',
    location: 'Central Arusha',
    seller: 'VoltEast Traders (sample)',
    audience: ['B2B', 'B2C'],
    stock: 'Sample: In stock',
    image: '/kijiji-electronics-art.svg',
  },
  {
    id: 4,
    name: 'Premium Chai Masala Blend',
    category: 'Food & beverages',
    description: 'Illustrative spiced tea listing. Confirm ingredients, packaging and availability with the seller.',
    price: 8500,
    wholesalePrice: 6200,
    minimumWholesaleQty: 40,
    unit: 'pack',
    location: 'Njiro',
    seller: 'Amani Kitchen Co. (sample)',
    audience: ['B2C'],
    stock: 'Sample: Preorder',
    image: '/fresh-produce.jpg',
  },
  {
    id: 5,
    name: 'Ergonomic Office Chair',
    category: 'Office supplies',
    description: 'Illustrative office chair listing. Confirm specifications, delivery and availability with the seller.',
    price: 175000,
    wholesalePrice: 152000,
    minimumWholesaleQty: 5,
    unit: 'piece',
    location: 'Sokoine Road',
    seller: 'Urban Workspace (sample)',
    audience: ['B2B'],
    stock: 'Sample: In stock',
    image: '/kijiji-product-art.svg',
  },
  {
    id: 6,
    name: 'Safari Travel Kit',
    category: 'Tourism products',
    description: 'Illustrative travel set listing. Confirm contents and availability with the seller.',
    price: 34000,
    wholesalePrice: 27000,
    minimumWholesaleQty: 20,
    unit: 'box',
    location: 'Arusha City Centre',
    seller: 'Serengeti Trail Goods (sample)',
    audience: ['B2B', 'B2C'],
    stock: 'Sample: Preorder',
    image: '/kijiji-travel-art.svg',
  },
]

export const productsSeed: Product[] = [...originalSamples, ...generatedSamples]

export const catalogueLastUpdated = '2026-10-28'

export function productArtworkFor(category: string) {
  return categoryDefaults[category]?.image ?? '/kijiji-product-art.svg'
}
