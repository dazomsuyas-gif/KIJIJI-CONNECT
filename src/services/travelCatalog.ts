export type TravelType = 'flights' | 'stays' | 'packages'

export type TravelOffer = {
  id: string
  type: TravelType
  name: string
  location: string
  description: string
  priceTzs: number
  priceUnit: string
  inclusions: string[]
  image: string
  tags: string[]
}

export const travelOffers: TravelOffer[] = [
  {
    id: 'flight-kia-dar',
    type: 'flights',
    name: 'Kilimanjaro Airport ↔ Dar es Salaam',
    location: 'JRO · DAR',
    description: 'A sample regional route with a per-adult, one-way planning estimate.',
    priceTzs: 390000,
    priceUnit: 'per adult, one way',
    inclusions: ['Suggested route: JRO to DAR', 'Allow time for airport transfer', 'Baggage and availability unverified'],
    image: '/tanzania-landscape.jpg',
    tags: ['JRO', 'DAR', 'Flight', 'Arusha'],
  },
  {
    id: 'flight-kia-zanzibar',
    type: 'flights',
    name: 'Kilimanjaro Airport ↔ Zanzibar',
    location: 'JRO · ZNZ',
    description: 'A sample island connection to help begin a Tanzania trip plan.',
    priceTzs: 465000,
    priceUnit: 'per adult, one way',
    inclusions: ['Suggested route: JRO to ZNZ', 'Check connections before booking', 'Airline schedule unverified'],
    image: '/tanzania-landscape.jpg',
    tags: ['JRO', 'ZNZ', 'Flight', 'Zanzibar'],
  },
  {
    id: 'flight-dar-mwanza',
    type: 'flights',
    name: 'Dar es Salaam ↔ Mwanza',
    location: 'DAR · MWZ',
    description: 'A sample domestic connection with a per-adult, one-way planning estimate.',
    priceTzs: 355000,
    priceUnit: 'per adult, one way',
    inclusions: ['Suggested route: DAR to MWZ', 'Fare rules not included', 'Schedule and availability unverified'],
    image: '/tanzania-landscape.jpg',
    tags: ['DAR', 'MWZ', 'Flight', 'Mwanza'],
  },
  {
    id: 'stay-arusha-garden',
    type: 'stays',
    name: 'Arusha Garden Stay',
    location: 'Central Arusha',
    description: 'Illustrative private-room option near city dining and tour pickup points.',
    priceTzs: 185000,
    priceUnit: 'per room, per night',
    inclusions: ['Private-room example', 'Ask the property to confirm breakfast', 'Taxes and availability unverified'],
    image: '/tanzania-landscape.jpg',
    tags: ['Arusha', 'Hotel', 'Guesthouse', 'City'],
  },
  {
    id: 'stay-mount-meru',
    type: 'stays',
    name: 'Mount Meru City Hotel',
    location: 'Arusha',
    description: 'Illustrative mid-range stay for travellers looking for a city base.',
    priceTzs: 345000,
    priceUnit: 'per room, per night',
    inclusions: ['Standard-room example', 'Ask for current meal options', 'Taxes and availability unverified'],
    image: '/tanzania-landscape.jpg',
    tags: ['Arusha', 'Hotel', 'Mid-range', 'City'],
  },
  {
    id: 'stay-safari-lodge',
    type: 'stays',
    name: 'Arusha Safari Lodge',
    location: 'Outskirts of Arusha',
    description: 'Illustrative lodge option for a quieter stay near regional excursion routes.',
    priceTzs: 640000,
    priceUnit: 'per room, per night',
    inclusions: ['Lodge-room example', 'Ask about transfers and meal plans', 'Taxes and availability unverified'],
    image: '/tanzania-landscape.jpg',
    tags: ['Arusha', 'Lodge', 'Safari', 'Outskirts'],
  },
  {
    id: 'package-city-culture',
    type: 'packages',
    name: 'Arusha City & Culture',
    location: 'Arusha · Full day',
    description: 'A sample full-day culture and city itinerary to tailor with a local guide.',
    priceTzs: 210000,
    priceUnit: 'per person, sample estimate',
    inclusions: ['City and heritage stops', 'Local-guide arrangements to confirm', 'Admission, meals and transport unverified'],
    image: '/kijiji-market-art.svg',
    tags: ['Arusha', 'Culture', 'Heritage', 'Day trip'],
  },
  {
    id: 'package-waterfall-coffee',
    type: 'packages',
    name: 'Materuni Waterfall & Coffee',
    location: 'Moshi · Full day',
    description: 'A sample waterfall visit and coffee experience for an Arusha-area itinerary.',
    priceTzs: 320000,
    priceUnit: 'per person, sample estimate',
    inclusions: ['Waterfall and village visit example', 'Confirm route, guide and fitness needs', 'Transfers and permits unverified'],
    image: '/tanzania-landscape.jpg',
    tags: ['Materuni', 'Moshi', 'Waterfall', 'Coffee'],
  },
  {
    id: 'package-serengeti',
    type: 'packages',
    name: 'Northern Tanzania Safari Starter',
    location: 'Arusha · Multi-day',
    description: 'A sample multi-day safari planning idea; itinerary and pricing require an operator quote.',
    priceTzs: 1850000,
    priceUnit: 'per person, sample estimate',
    inclusions: ['Planning estimate, not a safari quote', 'Park access and camping not confirmed', 'Operator, route and dates unverified'],
    image: '/tanzania-landscape.jpg',
    tags: ['Arusha', 'Safari', 'Serengeti', 'Multi-day'],
  },
]

export const travelTypeLabels: Record<TravelType, string> = {
  flights: 'Flights',
  stays: 'Hotels & stays',
  packages: 'Tour packages',
}
