const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search'
const OSRM_ROUTE_URL = 'https://router.project-osrm.org/route/v1/driving'
const MELBOURNE_VIEWBOX = '144.4,-37.4,145.8,-38.5'
const SEARCH_INTERVAL_MS = 1100

const searchCache = new Map()
let lastSearchStartedAt = 0

function isFiniteCoordinate(value) {
  return Number.isFinite(value)
}

function wait(milliseconds) {
  return new Promise((resolve) => globalThis.setTimeout(resolve, milliseconds))
}

export function normalisePlaceResults(payload) {
  if (!Array.isArray(payload)) return []

  return payload
    .map((place) => {
      const latitude = Number(place?.lat)
      const longitude = Number(place?.lon)

      if (!isFiniteCoordinate(latitude) || !isFiniteCoordinate(longitude)) return null

      return {
        id: String(place.place_id ?? `${latitude}-${longitude}`),
        name: String(place.display_name ?? 'Unnamed place'),
        latitude,
        longitude,
        type: String(place.type ?? place.category ?? 'place').replaceAll('_', ' '),
      }
    })
    .filter(Boolean)
}

export function normaliseRouteResponse(payload) {
  if (payload?.code !== 'Ok' || !Array.isArray(payload.routes) || payload.routes.length === 0) {
    throw new Error('No driving route was found between these places.')
  }

  const route = payload.routes[0]
  const rawCoordinates = route?.geometry?.coordinates
  const distance = Number(route?.distance)
  const duration = Number(route?.duration)

  if (!Array.isArray(rawCoordinates) || rawCoordinates.length < 2) {
    throw new Error('The route service returned an incomplete route.')
  }

  const coordinates = rawCoordinates
    .map(([longitude, latitude]) => [Number(latitude), Number(longitude)])
    .filter(
      ([latitude, longitude]) => isFiniteCoordinate(latitude) && isFiniteCoordinate(longitude),
    )

  if (coordinates.length < 2 || !isFiniteCoordinate(distance) || !isFiniteCoordinate(duration)) {
    throw new Error('The route service returned invalid trip information.')
  }

  return {
    coordinates,
    distanceKm: Math.round((distance / 1000) * 10) / 10,
    durationMinutes: Math.max(1, Math.round(duration / 60)),
  }
}

function validateEndpoint(endpoint) {
  return (
    endpoint &&
    typeof endpoint.name === 'string' &&
    isFiniteCoordinate(endpoint.latitude) &&
    isFiniteCoordinate(endpoint.longitude)
  )
}

export async function searchMelbournePlaces(query, fetchImplementation = fetch) {
  const normalisedQuery = query.trim().replace(/\s+/g, ' ')
  if (normalisedQuery.length < 2) {
    throw new Error('Enter at least two characters to search for a place.')
  }

  const cacheKey = normalisedQuery.toLocaleLowerCase('en-AU')
  if (searchCache.has(cacheKey)) return searchCache.get(cacheKey)

  const waitTime = Math.max(0, SEARCH_INTERVAL_MS - (Date.now() - lastSearchStartedAt))
  if (waitTime > 0) await wait(waitTime)
  lastSearchStartedAt = Date.now()

  const parameters = new URLSearchParams({
    q: `${normalisedQuery}, Melbourne, Victoria`,
    format: 'jsonv2',
    limit: '5',
    countrycodes: 'au',
    viewbox: MELBOURNE_VIEWBOX,
    bounded: '1',
  })

  let response
  try {
    response = await fetchImplementation(`${NOMINATIM_SEARCH_URL}?${parameters}`, {
      headers: { Accept: 'application/json' },
    })
  } catch {
    throw new Error('Place search is temporarily unavailable. Please try again.')
  }

  if (!response.ok) {
    throw new Error('Place search is temporarily unavailable. Please try again.')
  }

  const results = normalisePlaceResults(await response.json())
  searchCache.set(cacheKey, results)
  return results
}

export async function fetchRoute(start, destination, fetchImplementation = fetch) {
  if (!validateEndpoint(start) || !validateEndpoint(destination)) {
    throw new Error('Choose both a start and destination before planning a route.')
  }

  if (start.latitude === destination.latitude && start.longitude === destination.longitude) {
    throw new Error('Choose two different places for the route.')
  }

  const coordinates = `${start.longitude},${start.latitude};${destination.longitude},${destination.latitude}`
  const parameters = new URLSearchParams({ overview: 'full', geometries: 'geojson' })

  let response
  try {
    response = await fetchImplementation(`${OSRM_ROUTE_URL}/${coordinates}?${parameters}`, {
      headers: { Accept: 'application/json' },
    })
  } catch {
    throw new Error('Route planning is temporarily unavailable. Please try again.')
  }

  if (!response.ok) {
    throw new Error('Route planning is temporarily unavailable. Please try again.')
  }

  return normaliseRouteResponse(await response.json())
}
