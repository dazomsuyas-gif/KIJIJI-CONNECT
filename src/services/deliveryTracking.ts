export type DeliveryStatus = 'pending-sender' | 'accepted' | 'sent' | 'delivered'

export type ArushaDeliveryPlace = {
  id: string
  name: string
  area: string
  latitude: number
  longitude: number
}

export const arushaDeliveryPlaces: ArushaDeliveryPlace[] = [
  { id: 'city-centre', name: 'Arusha City Centre', area: 'Central Arusha', latitude: -3.3869, longitude: 36.6830 },
  { id: 'clock-tower', name: 'Clock Tower', area: 'CBD', latitude: -3.3868, longitude: 36.6833 },
  { id: 'sakina', name: 'Sakina', area: 'West Arusha', latitude: -3.3738, longitude: 36.6509 },
  { id: 'njiro', name: 'Njiro', area: 'South Arusha', latitude: -3.4250, longitude: 36.7003 },
  { id: 'tengeru', name: 'Tengeru', area: 'East Arusha', latitude: -3.3691, longitude: 36.8270 },
  { id: 'usa-river', name: 'Usa River', area: 'Arumeru', latitude: -3.3667, longitude: 36.8500 },
  { id: 'kisongo', name: 'Kisongo', area: 'West Arusha', latitude: -3.3900, longitude: 36.6000 },
  { id: 'kijenge', name: 'Kijenge', area: 'North Arusha', latitude: -3.3558, longitude: 36.6940 },
]

export function deliveryStatusLabel(status: DeliveryStatus): string {
  return {
    'pending-sender': 'Waiting for sender acceptance',
    accepted: 'Accepted by sender',
    sent: 'Sent by sender · tracking active',
    delivered: 'Delivered to place',
  }[status]
}

export function deliveryStatusIndex(status: DeliveryStatus): number {
  return ['pending-sender', 'accepted', 'sent', 'delivered'].indexOf(status)
}
