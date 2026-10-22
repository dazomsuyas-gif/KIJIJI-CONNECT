import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import {
  travelOffers,
  travelTypeLabels,
  type TravelOffer,
  type TravelType,
} from '../services/travelCatalog'
import { businessContact, businessSupportEmail } from '../config/contact'

export type TravelBookingRequest = {
  id: string
  offerId: string
  offerName: string
  type: TravelType
  startDate: string
  endDate: string
  travelers: number
  rooms: number
  estimateTzs: number
  createdAt: string
  status: 'Enquiry only · not reserved'
}

export type TravelAssistantCommand = {
  message: string
  nonce: number
}

type TravelPlanningStudioProps = {
  category: TravelType
  onCategoryChange: (category: TravelType) => void
  query: string
  onQueryChange: (query: string) => void
  assistantCommand: TravelAssistantCommand | null
  requests: TravelBookingRequest[]
  onRequestCreated: (request: TravelBookingRequest) => void
}

const dateOffset = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function createBookingContactLinks(
  offer: TravelOffer,
  request: TravelBookingRequest,
  contactName: string,
  email: string,
  phone: string,
) {
  const message = [
    'Hello Kijiji Connect, please help me check this travel enquiry.',
    `Option: ${offer.name}`,
    `Name: ${contactName}`,
    `Contact email: ${email}`,
    phone ? `WhatsApp: ${phone}` : '',
    `Dates: ${request.startDate}${request.endDate ? ` to ${request.endDate}` : ''}`,
    `Travel group: ${request.travelers} people · ${request.rooms} room(s)`,
    `Illustrative estimate: TZS ${request.estimateTzs.toLocaleString('en-US')}`,
    'I understand this is a request for information, not a reservation or confirmed price.',
  ].filter(Boolean).join('\n')

  return {
    whatsapp: `${businessContact.whatsappUrl}?text=${encodeURIComponent(message)}`,
    email: `mailto:${businessSupportEmail}?subject=${encodeURIComponent(`Travel enquiry · ${offer.name}`)}&body=${encodeURIComponent(message)}`,
  }
}

export function TravelPlanningStudio({
  category,
  onCategoryChange,
  query,
  onQueryChange,
  assistantCommand,
  requests,
  onRequestCreated,
}: TravelPlanningStudioProps) {
  const [checkIn, setCheckIn] = useState(dateOffset(7))
  const [checkOut, setCheckOut] = useState(dateOffset(8))
  const [travelers, setTravelers] = useState('2')
  const [rooms, setRooms] = useState('1')
  const [returnFlight, setReturnFlight] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState<TravelOffer | null>(null)
  const [contactName, setContactName] = useState('')
  const [contactEmailAddress, setContactEmailAddress] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [formError, setFormError] = useState('')
  const [latestRequestLinks, setLatestRequestLinks] = useState<{ id: string; whatsapp: string; email: string } | null>(null)
  const [plannerDestination, setPlannerDestination] = useState('Arusha')
  const [plannerInterest, setPlannerInterest] = useState('Wildlife and nature')
  const [plannerDuration, setPlannerDuration] = useState('3')
  const [itinerary, setItinerary] = useState<string[]>([])
  const lastHandledCommand = useRef<number | null>(null)

  useEffect(() => {
    if (!assistantCommand || lastHandledCommand.current === assistantCommand.nonce) return
    lastHandledCommand.current = assistantCommand.nonce

    const message = assistantCommand.message.trim()
    const lower = message.toLowerCase()
    const nextCategory: TravelType = /\b(?:hotel|hotels|stay|stays|room|accommodation)\b/.test(lower)
      ? 'stays'
      : /\b(?:flight|flights|ticket|tickets|airline|airlines|airport)\b/.test(lower)
        ? 'flights'
        : /\b(?:package|packages|safari|tour|tours|trip|travel)\b/.test(lower)
          ? 'packages'
          : category
    onCategoryChange(nextCategory)

    const nextDestination = /\b(?:hotel|hotels|stay|stays|room|accommodation)\b/.test(lower)
      ? message.match(/\b(?:in|near)\s+([a-z]+(?:\s+[a-z]+){0,2}?)(?=\s+(?:for|with|from|on|between|during|starting)\b|[,.?!]|$)/i)?.[1]
      : message.match(/\b(?:in|to|around)\s+([a-z]+(?:\s+[a-z]+){0,2}?)(?=\s+(?:for|with|from|on|between|during|starting)\b|[,.?!]|$)/i)?.[1]
    if (nextDestination) onQueryChange(nextDestination)

    const guestMatch = lower.match(/\b(\d{1,2})\s+(?:travellers?|travelers?|guests?|people|adults?)\b/)
    if (guestMatch) setTravelers(guestMatch[1])

    const nightMatch = lower.match(/\b(\d{1,2})\s+nights?\b/)
    if (nightMatch) {
      const nights = Number(nightMatch[1])
      setCheckOut(dateOffset(Math.max(2, nights + 7)))
    }

    const dates = message.match(/\b20\d{2}-\d{2}-\d{2}\b/g)
    if (dates?.[0]) setCheckIn(dates[0])
    if (dates?.[1]) setCheckOut(dates[1])
    document.getElementById('travel-booking')?.scrollIntoView({ behavior: 'smooth' })
  }, [assistantCommand, category, onCategoryChange, onQueryChange])

  const visibleOffers = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return travelOffers.filter((offer) => {
      if (offer.type !== category) return false
      if (!normalized) return true
      const searchableContent = `${offer.name} ${offer.location} ${offer.description} ${offer.tags.join(' ')}`.toLowerCase()
      return searchableContent.includes(normalized)
    })
  }, [category, query])

  const nights = Math.max(1, Math.round(
    (new Date(`${checkOut}T12:00:00`).getTime() - new Date(`${checkIn}T12:00:00`).getTime()) / 86_400_000,
  ))

  const calculateEstimate = (offer: TravelOffer) => {
    const partySize = Math.max(1, Number(travelers) || 1)
    if (offer.type === 'stays') return offer.priceTzs * nights * Math.max(1, Number(rooms) || 1)
    if (offer.type === 'flights') return offer.priceTzs * partySize * (returnFlight ? 2 : 1)
    return offer.priceTzs * partySize
  }

  const handleOpenEnquiry = (offer: TravelOffer) => {
    setSelectedOffer(offer)
    setFormError('')
    setLatestRequestLinks(null)
    document.getElementById('travel-enquiry-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const handleRequestBooking = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedOffer) {
      setFormError('Choose a travel option before requesting an enquiry.')
      return
    }

    const guestCount = Number(travelers)
    const roomCount = Number(rooms)
    if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 12) {
      setFormError('Enter a group size from 1 to 12 travellers.')
      return
    }
    if (selectedOffer.type === 'stays' && (!Number.isInteger(roomCount) || roomCount < 1 || roomCount > 6)) {
      setFormError('For a hotel enquiry, choose between 1 and 6 rooms.')
      return
    }
    if (!checkIn || checkIn < dateOffset(0)) {
      setFormError('Choose a travel start date that is today or later.')
      return
    }
    if (selectedOffer.type === 'stays' && (!checkOut || checkOut <= checkIn)) {
      setFormError('For a hotel enquiry, checkout must be after check-in.')
      return
    }
    if (selectedOffer.type === 'flights' && returnFlight && (!checkOut || checkOut < checkIn)) {
      setFormError('Choose a return date on or after the flight departure date.')
      return
    }

    const requestId = `KC-TRIP-${Date.now().toString(36).toUpperCase()}`
    const request: TravelBookingRequest = {
      id: requestId,
      offerId: selectedOffer.id,
      offerName: selectedOffer.name,
      type: selectedOffer.type,
      startDate: checkIn,
      endDate: selectedOffer.type === 'flights' && !returnFlight ? '' : checkOut,
      travelers: guestCount,
      rooms: selectedOffer.type === 'stays' ? roomCount : 0,
      estimateTzs: calculateEstimate(selectedOffer),
      createdAt: new Date().toLocaleString(),
      status: 'Enquiry only · not reserved',
    }
    const links = createBookingContactLinks(
      selectedOffer,
      request,
      contactName.trim(),
      contactEmailAddress.trim(),
      contactPhone.trim(),
    )
    onRequestCreated(request)
    setLatestRequestLinks({ id: requestId, ...links })
    setFormError('')
  }

  const handleCreateItinerary = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const numberOfDays = Math.max(1, Math.min(14, Number(plannerDuration) || 3))
    const themes: Record<string, string[]> = {
      'Wildlife and nature': ['Confirm park entry and a licensed guide', 'Plan a wildlife and nature excursion', 'Leave time for rest and a weather check'],
      'Culture and food': ['Arrange a community-led cultural visit', 'Explore local food with a trusted host', 'Leave time for a heritage centre visit'],
      'Waterfalls and coffee': ['Confirm a local guide and walking requirements', 'Plan a waterfall visit and coffee experience', 'Check transfers and weather before departing'],
      'Relax and explore': ['Explore Arusha with a locally recommended guide', 'Keep a flexible afternoon for rest', 'Check opening times before visiting attractions'],
    }
    const selectedIdeas = themes[plannerInterest] ?? themes['Wildlife and nature']
    const suggestion = Array.from({ length: numberOfDays }, (_, index) =>
      `Day ${index + 1} · ${selectedIdeas[index % selectedIdeas.length]}`,
    )
    setItinerary(suggestion)
    setFormError('')
  }

  return (
    <div className="travel-studio">
      <div className="travel-search-banner">
        <div className="travel-search-copy">
          <span className="eyebrow">Plan your Tanzania trip</span>
          <h3>One thoughtful starting point for your journey.</h3>
          <p>Explore sample routes, Arusha stay types and local itineraries. Every listing below is illustrative: ask a licensed provider to verify dates, price, safety, permits and availability before making plans.</p>
        </div>
        <div className="travel-search-fields">
          <label>Start date<input type="date" value={checkIn} min={dateOffset(0)} onChange={(event) => setCheckIn(event.target.value)} /></label>
          <label>{category === 'stays' ? 'Check-out' : 'Return date (if needed)'}<input type="date" value={checkOut} min={checkIn} onChange={(event) => setCheckOut(event.target.value)} /></label>
          <label>Travellers<input type="number" min="1" max="12" value={travelers} onChange={(event) => setTravelers(event.target.value)} /></label>
          {category === 'stays' && <label>Rooms<input type="number" min="1" max="6" value={rooms} onChange={(event) => setRooms(event.target.value)} /></label>}
          {category === 'flights' && (
            <label className="travel-return-toggle">
              <input type="checkbox" checked={returnFlight} onChange={(event) => setReturnFlight(event.target.checked)} />
              Ask about return travel
            </label>
          )}
        </div>
      </div>

      <div className="travel-type-tabs" role="tablist" aria-label="Travel options">
        {(Object.keys(travelTypeLabels) as TravelType[]).map((type) => (
          <button
            type="button"
            key={type}
            role="tab"
            aria-selected={category === type}
            className={category === type ? 'travel-type-tab active' : 'travel-type-tab'}
            onClick={() => onCategoryChange(type)}
          >
            <span>{type === 'flights' ? '✈' : type === 'stays' ? '⌂' : '◎'}</span>{travelTypeLabels[type]}
          </button>
        ))}
      </div>

      <div className="travel-filters">
        <label htmlFor="travel-search">Search {travelTypeLabels[category].toLowerCase()}</label>
        <input id="travel-search" type="search" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder={category === 'flights' ? 'Airport, city or route' : 'Arusha, safari, culture…'} />
        {category === 'stays' && <p>Stay estimate: {nights} night{nights === 1 ? '' : 's'} · {rooms} room{Number(rooms) === 1 ? '' : 's'}</p>}
        <span role="status">{visibleOffers.length} illustrative option{visibleOffers.length === 1 ? '' : 's'}</span>
      </div>

      {visibleOffers.length > 0 ? (
        <div className="travel-offer-grid">
          {visibleOffers.map((offer) => {
            const estimate = calculateEstimate(offer)
            return (
              <article key={offer.id} className="travel-offer-card">
                <div className="travel-offer-photo">
                  <img src={offer.image} alt="" loading="lazy" />
                  <span>Example listing · not live inventory</span>
                </div>
                <div className="travel-offer-body">
                  <span className="travel-location">{offer.location}</span>
                  <h3>{offer.name}</h3>
                  <p>{offer.description}</p>
                  <ul>{offer.inclusions.map((inclusion) => <li key={inclusion}>{inclusion}</li>)}</ul>
                  <div className="travel-offer-footer">
                    <div>
                      <strong>TZS {offer.priceTzs.toLocaleString('en-US')}</strong>
                      <span>{offer.priceUnit}</span>
                      {category !== 'packages' && <small>Current estimate for this enquiry: TZS {estimate.toLocaleString('en-US')}</small>}
                    </div>
                    <button type="button" className="primary-button compact" onClick={() => handleOpenEnquiry(offer)}>
                      Request details
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="travel-empty-state">
          <strong>No sample options match that search.</strong>
          <span>Try a city, airport code or destination—or clear your search to browse all {travelTypeLabels[category].toLowerCase()}.</span>
        </div>
      )}

      <div className="trip-planner">
        <div>
          <span className="eyebrow">Guided trip builder · Local planning demo</span>
          <h3>Get a practical itinerary starting point.</h3>
          <p>Build a suggestion from your interests. It does not check live conditions or replace a licensed tour operator.</p>
        </div>
        <form onSubmit={handleCreateItinerary}>
          <label>Starting area<input value={plannerDestination} onChange={(event) => setPlannerDestination(event.target.value)} required /></label>
          <label>Interests<select value={plannerInterest} onChange={(event) => setPlannerInterest(event.target.value)}>
            <option>Wildlife and nature</option><option>Culture and food</option><option>Waterfalls and coffee</option><option>Relax and explore</option>
          </select></label>
          <label>Trip days<input type="number" min="1" max="14" value={plannerDuration} onChange={(event) => setPlannerDuration(event.target.value)} /></label>
          <button type="submit" className="secondary-button">Suggest a day plan</button>
        </form>
        {itinerary.length > 0 && (
          <ol className="trip-itinerary" aria-live="polite">
            {itinerary.map((item) => <li key={item}><strong>{plannerDestination}:</strong> {item.replace(/^Day \d+ · /, '')}</li>)}
          </ol>
        )}
      </div>

      {selectedOffer && (
        <form id="travel-enquiry-form" className="travel-enquiry-form" onSubmit={handleRequestBooking}>
          <div className="travel-enquiry-heading">
            <div><span className="eyebrow">Enquiry · No payment required</span><h3>Ask about {selectedOffer.name}</h3><p>This creates a local enquiry draft. It does not send a message, reserve travel or confirm availability.</p></div>
            <button type="button" className="ghost-button small" onClick={() => {
              setSelectedOffer(null)
              setLatestRequestLinks(null)
              setFormError('')
            }}>Cancel</button>
          </div>
          <div className="travel-enquiry-fields">
            <label>Your name<input value={contactName} onChange={(event) => setContactName(event.target.value)} autoComplete="name" required /></label>
            <label>Email address<input type="email" value={contactEmailAddress} onChange={(event) => setContactEmailAddress(event.target.value)} autoComplete="email" required /></label>
            <label>WhatsApp number (optional)<input type="tel" value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} autoComplete="tel" placeholder="+255 7XX XXX XXX" /></label>
          </div>
          <div className="travel-estimate-bar">
            <span>Indicative subtotal · not a quote or confirmed price</span>
            <strong>TZS {calculateEstimate(selectedOffer).toLocaleString('en-US')}</strong>
          </div>
          {formError && <p role="alert" className="storage-error">{formError}</p>}
          <button type="submit" className="primary-button">Prepare my enquiry</button>
          {latestRequestLinks && latestRequestLinks.id && (
            <div className="travel-request-success" role="status">
              <strong>Enquiry draft {latestRequestLinks.id} is ready.</strong>
              <p>No reservation or message was made. Choose a channel below to open a prefilled message and review it before you send.</p>
              <div className="travel-contact-actions">
                <a className="primary-button compact" href={latestRequestLinks.whatsapp} target="_blank" rel="noreferrer">Review on WhatsApp</a>
                <a className="secondary-button compact" href={latestRequestLinks.email}>Review email draft</a>
              </div>
            </div>
          )}
        </form>
      )}

      {requests.length > 0 && (
        <div className="travel-request-history">
          <div className="section-heading"><div><span className="eyebrow">This device only</span><h3>Recent travel enquiry drafts</h3></div><span className="status-pill">{requests.length} request{requests.length === 1 ? '' : 's'}</span></div>
          {requests.slice(0, 5).map((request) => (
            <div className="travel-request-row" key={request.id}>
              <div><strong>{request.offerName}</strong><span>{travelTypeLabels[request.type]} · {request.startDate}{request.endDate ? ` – ${request.endDate}` : ''}</span><small>{request.id} · {request.status}</small></div>
              <strong>TZS {request.estimateTzs.toLocaleString('en-US')}<small>indicative estimate</small></strong>
            </div>
          ))}
        </div>
      )}

      <p className="travel-disclaimer">
        Travel rates shown are invented, illustrative examples used to demonstrate the interface; they are not verified current Arusha hotel prices, airline fares, or tour quotes. No live inventory, flight schedules, bookings, payments or provider APIs are connected. Confirm current terms, operator licensing, safety, insurance, visa requirements and all prices with relevant official or licensed providers before booking.
      </p>
    </div>
  )
}
