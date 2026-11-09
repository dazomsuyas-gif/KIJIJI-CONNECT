import { useState } from 'react'
import { CircleMarker, MapContainer, TileLayer, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { arushaDeliveryPlaces } from '../services/deliveryTracking'

const placeForName = (name: string) =>
  arushaDeliveryPlaces.find((place) => place.name === name) ?? arushaDeliveryPlaces[0]

export function ArushaDeliveryMap({ selectedPlace }: { selectedPlace: string }) {
  const [tileError, setTileError] = useState(false)
  const selected = placeForName(selectedPlace)

  return (
    <div className="arusha-map">
      <MapContainer
        key={selected.id}
        className="arusha-leaflet-map"
        center={[selected.latitude, selected.longitude]}
        zoom={12}
        scrollWheelZoom={false}
        aria-label="Interactive Arusha delivery destination map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          eventHandlers={{ tileerror: () => setTileError(true) }}
        />
        {arushaDeliveryPlaces.map((place) => {
          const isSelected = place.id === selected.id
          return (
            <CircleMarker
              key={place.id}
              center={[place.latitude, place.longitude]}
              radius={isSelected ? 9 : 6}
              pathOptions={{
                color: isSelected ? 'var(--color-gold-700)' : 'var(--color-forest-900)',
                fillColor: isSelected ? 'var(--color-gold-500)' : 'var(--color-forest-700)',
                fillOpacity: 0.9,
                weight: 2,
              }}
            >
              <Tooltip>{`${place.name} · ${place.area}`}</Tooltip>
            </CircleMarker>
          )
        })}
      </MapContainer>
      <div className="arusha-map__labels">
        <strong>Delivery destination: {selected.name}</strong>
        <span>Local destination points only. This is not live driver GPS.</span>
        {tileError && <span role="status">Map tiles are unavailable. The destination list and coordinates remain available below.</span>}
      </div>
    </div>
  )
}
