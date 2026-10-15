<script setup>
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { fetchRoute, searchMelbournePlaces } from '@/services/mapService'

const LEAFLET_VERSION = '1.9.4'
const LEAFLET_STYLE_URL = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.css`
const LEAFLET_SCRIPT_URL = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.js`
const MELBOURNE_CENTRE = [-37.8136, 144.9631]

const DEFAULT_START = {
  name: 'Federation Square, Melbourne',
  latitude: -37.8179,
  longitude: 144.9691,
}
const DEFAULT_DESTINATION = {
  name: 'Royal Botanic Gardens Victoria, Melbourne',
  latitude: -37.8304,
  longitude: 144.9796,
}

const mapElement = ref(null)
const query = ref('')
const results = ref([])
const selectedPlace = ref(null)
const start = ref({ ...DEFAULT_START })
const destination = ref({ ...DEFAULT_DESTINATION })
const route = ref(null)
const searchStatus = ref('idle')
const searchMessage = ref('Search for a public Melbourne place or point of interest.')
const routeStatus = ref('idle')
const routeMessage = ref('Two example Melbourne places are ready. Select Plan route to begin.')
const mapStatus = ref('loading')

let leaflet = null
let map = null
let placeLayer = null
let routeLayer = null
let leafletPromise = null

function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L)
  if (leafletPromise) return leafletPromise

  leafletPromise = new Promise((resolve, reject) => {
    if (!document.querySelector(`link[href="${LEAFLET_STYLE_URL}"]`)) {
      const stylesheet = document.createElement('link')
      stylesheet.rel = 'stylesheet'
      stylesheet.href = LEAFLET_STYLE_URL
      stylesheet.crossOrigin = 'anonymous'
      document.head.append(stylesheet)
    }

    const existingScript = document.querySelector(`script[src="${LEAFLET_SCRIPT_URL}"]`)
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.L), { once: true })
      existingScript.addEventListener('error', reject, { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = LEAFLET_SCRIPT_URL
    script.crossOrigin = 'anonymous'
    script.onload = () => resolve(window.L)
    script.onerror = reject
    document.head.append(script)
  })

  return leafletPromise
}

function endpointFromPlace(place) {
  return {
    name: place.name,
    latitude: place.latitude,
    longitude: place.longitude,
  }
}

function createMarker(endpoint, label, colour) {
  if (!map || !leaflet) return null

  const icon = leaflet.divIcon({
    className: 'map-pin-shell',
    html: `<span class="map-pin" style="--pin-colour:${colour}" aria-hidden="true">${label}</span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  })

  return leaflet.marker([endpoint.latitude, endpoint.longitude], {
    alt: `${label}: ${endpoint.name}`,
    title: endpoint.name,
    keyboard: true,
    icon,
  })
}

function drawSelectedPlace(place) {
  if (!map || !leaflet) return
  placeLayer.clearLayers()
  createMarker(place, 'P', '#245ea8')?.addTo(placeLayer).bindPopup(place.name).openPopup()
  map.setView([place.latitude, place.longitude], 15)
}

function drawEndpoints() {
  if (!map || !leaflet) return
  routeLayer.clearLayers()
  createMarker(start.value, 'A', '#0b5d53')
    ?.addTo(routeLayer)
    .bindPopup(`Start: ${start.value.name}`)
  createMarker(destination.value, 'B', '#b42318')
    ?.addTo(routeLayer)
    .bindPopup(`Destination: ${destination.value.name}`)
}

function drawRoute() {
  drawEndpoints()
  if (!map || !leaflet || !route.value) return

  const line = leaflet.polyline(route.value.coordinates, {
    color: '#245ea8',
    weight: 6,
    opacity: 0.9,
  })
  line.addTo(routeLayer)
  map.fitBounds(line.getBounds(), { padding: [36, 36] })
}

async function handleSearch() {
  searchStatus.value = 'loading'
  searchMessage.value = `Searching for ${query.value.trim() || 'a place'}…`
  results.value = []

  try {
    const places = await searchMelbournePlaces(query.value)
    results.value = places
    searchStatus.value = places.length ? 'success' : 'empty'
    searchMessage.value = places.length
      ? `${places.length} place ${places.length === 1 ? 'result' : 'results'} found.`
      : 'No matching Melbourne places were found. Try a broader public place name.'
  } catch (error) {
    searchStatus.value = 'error'
    searchMessage.value = error.message
  }
}

function selectPlace(place) {
  selectedPlace.value = place
  drawSelectedPlace(place)
  searchMessage.value = `${place.name} selected and shown on the map.`
}

function useAsStart(place) {
  selectPlace(place)
  start.value = endpointFromPlace(place)
  route.value = null
  routeStatus.value = 'idle'
  routeMessage.value = `${place.name} is now the route start.`
  drawEndpoints()
}

function useAsDestination(place) {
  selectPlace(place)
  destination.value = endpointFromPlace(place)
  route.value = null
  routeStatus.value = 'idle'
  routeMessage.value = `${place.name} is now the destination.`
  drawEndpoints()
}

async function planRoute() {
  routeStatus.value = 'loading'
  routeMessage.value = 'Planning the driving route…'

  try {
    route.value = await fetchRoute(start.value, destination.value)
    routeStatus.value = 'success'
    routeMessage.value = `Route ready: ${route.value.distanceKm} kilometres, approximately ${route.value.durationMinutes} minutes.`
    drawRoute()
  } catch (error) {
    route.value = null
    routeStatus.value = 'error'
    routeMessage.value = error.message
    drawEndpoints()
  }
}

function clearRoute() {
  start.value = { ...DEFAULT_START }
  destination.value = { ...DEFAULT_DESTINATION }
  route.value = null
  routeStatus.value = 'idle'
  routeMessage.value = 'Route cleared. The two example Melbourne places are ready again.'
  drawEndpoints()
  map?.fitBounds(
    [
      [start.value.latitude, start.value.longitude],
      [destination.value.latitude, destination.value.longitude],
    ],
    { padding: [50, 50] },
  )
}

onMounted(async () => {
  try {
    leaflet = await loadLeaflet()
    await nextTick()
    map = leaflet.map(mapElement.value, { zoomControl: true }).setView(MELBOURNE_CENTRE, 13)
    leaflet
      .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      })
      .addTo(map)
    placeLayer = leaflet.layerGroup().addTo(map)
    routeLayer = leaflet.layerGroup().addTo(map)
    if (route.value) drawRoute()
    else drawEndpoints()
    mapStatus.value = 'ready'
  } catch {
    mapStatus.value = 'error'
    routeStatus.value = 'error'
    routeMessage.value =
      'The visual map could not load. Search and textual place information remain available.'
  }
})

onUnmounted(() => {
  map?.remove()
  map = null
  placeLayer = null
  routeLayer = null
})
</script>

<template>
  <div class="page-heading">
    <p class="eyebrow">Melbourne climate action map</p>
    <h1>Find a place and plan a trip</h1>
    <p class="lede">
      Search public Melbourne places, choose route endpoints, and view driving distance and
      estimated time.
    </p>
  </div>

  <div class="map-layout">
    <section class="map-tools card" aria-labelledby="place-search-heading">
      <h2 id="place-search-heading">1. Search for a place</h2>
      <form class="search-form" role="search" @submit.prevent="handleSearch">
        <div class="field">
          <label for="place-query">Public place or point of interest</label>
          <input
            id="place-query"
            v-model="query"
            type="search"
            minlength="2"
            required
            autocomplete="off"
            placeholder="For example: Melbourne Museum"
          />
          <small>Search happens only when you submit. Do not enter private information.</small>
        </div>
        <button class="primary-button" type="submit" :disabled="searchStatus === 'loading'">
          <i class="pi pi-search" aria-hidden="true"></i>
          {{ searchStatus === 'loading' ? 'Searching…' : 'Search places' }}
        </button>
      </form>

      <p
        class="status-text"
        :class="{ 'error-text': searchStatus === 'error' }"
        aria-live="polite"
        aria-atomic="true"
      >
        {{ searchMessage }}
      </p>

      <ul v-if="results.length" class="place-results" aria-label="Place search results">
        <li v-for="place in results" :key="place.id" class="place-result">
          <button class="place-select" type="button" @click="selectPlace(place)">
            <strong>{{ place.name }}</strong>
            <span>{{ place.type }}</span>
          </button>
          <div class="endpoint-actions" aria-label="Use this place in the route">
            <button class="secondary-button" type="button" @click="useAsStart(place)">
              Use as start
            </button>
            <button class="secondary-button" type="button" @click="useAsDestination(place)">
              Use as destination
            </button>
          </div>
        </li>
      </ul>

      <div v-if="selectedPlace" class="selected-place" aria-live="polite">
        <strong>Selected place</strong>
        <span>{{ selectedPlace.name }}</span>
      </div>
    </section>

    <section class="map-card card" aria-labelledby="map-heading">
      <div class="map-card-heading">
        <div>
          <h2 id="map-heading">Interactive map</h2>
          <p>Use the + and − controls to zoom. Route details are also provided below as text.</p>
        </div>
        <span class="map-state">
          {{
            mapStatus === 'ready'
              ? 'Map ready'
              : mapStatus === 'error'
                ? 'Map unavailable'
                : 'Map loading'
          }}
        </span>
      </div>
      <div
        ref="mapElement"
        class="map-canvas"
        role="region"
        aria-label="Interactive map of Melbourne showing selected places and routes"
      ></div>
    </section>
  </div>

  <section class="route-card card" aria-labelledby="route-heading">
    <div class="route-heading-row">
      <div>
        <p class="eyebrow">Trip information</p>
        <h2 id="route-heading">2. Plan a route</h2>
      </div>
      <div class="route-actions">
        <button
          class="primary-button"
          type="button"
          :disabled="routeStatus === 'loading'"
          @click="planRoute"
        >
          <i class="pi pi-directions" aria-hidden="true"></i>
          {{ routeStatus === 'loading' ? 'Planning…' : 'Plan route' }}
        </button>
        <button class="secondary-button" type="button" @click="clearRoute">Clear route</button>
      </div>
    </div>

    <dl class="route-endpoints">
      <div>
        <dt>Start</dt>
        <dd>{{ start.name }}</dd>
      </div>
      <div>
        <dt>Destination</dt>
        <dd>{{ destination.name }}</dd>
      </div>
      <div>
        <dt>Distance</dt>
        <dd>{{ route ? `${route.distanceKm} km` : 'Plan the route to calculate' }}</dd>
      </div>
      <div>
        <dt>Estimated driving time</dt>
        <dd>{{ route ? `${route.durationMinutes} minutes` : 'Plan the route to calculate' }}</dd>
      </div>
    </dl>

    <p
      class="status-text"
      :class="{ 'error-text': routeStatus === 'error' }"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ routeMessage }}
    </p>
  </section>
</template>

<style scoped>
.map-layout {
  display: grid;
  grid-template-columns: minmax(300px, 0.75fr) minmax(0, 1.25fr);
  gap: 1.25rem;
  align-items: start;
}

.map-tools,
.map-card,
.route-card {
  padding: clamp(1rem, 3vw, 1.5rem);
}

.map-tools h2,
.map-card h2,
.route-card h2 {
  margin-bottom: 0.5rem;
}

.search-form {
  display: grid;
  gap: 0.85rem;
  margin-top: 1rem;
}

.field small,
.map-card-heading p {
  color: var(--ink-500);
}

.search-form .primary-button {
  justify-self: start;
}

.primary-button i {
  margin-right: 0.35rem;
}

.status-text {
  min-height: 1.5rem;
  margin: 1rem 0 0;
  color: var(--ink-700);
  font-weight: 650;
}

.error-text {
  color: var(--danger);
}

.place-results {
  display: grid;
  gap: 0.75rem;
  padding: 0;
  margin: 1rem 0 0;
  list-style: none;
}

.place-result {
  padding: 0.8rem;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--surface-soft);
}

.place-select {
  width: 100%;
  border: 0;
  padding: 0;
  color: var(--ink-950);
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.place-select strong,
.place-select span {
  display: block;
}

.place-select span {
  margin-top: 0.2rem;
  color: var(--ink-500);
  text-transform: capitalize;
}

.endpoint-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.endpoint-actions .secondary-button {
  min-height: 38px;
  padding: 0.4rem 0.65rem;
  font-size: 0.85rem;
}

.selected-place {
  display: grid;
  gap: 0.15rem;
  margin-top: 1rem;
  padding: 0.8rem;
  border-left: 4px solid var(--info);
  background: var(--info-soft);
}

.map-card-heading,
.route-heading-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.map-card-heading p {
  margin-bottom: 0.8rem;
}

.map-state {
  align-self: flex-start;
  white-space: nowrap;
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  color: var(--brand-800);
  background: var(--brand-100);
  font-size: 0.8rem;
  font-weight: 750;
}

.map-canvas {
  min-height: 510px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: #e8efed;
}

.map-canvas:focus-within {
  outline: 3px solid #f2b84b;
  outline-offset: 3px;
}

.route-card {
  margin-top: 1.25rem;
}

.route-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  align-self: center;
}

.route-endpoints {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.8rem;
  margin: 1rem 0 0;
}

.route-endpoints div {
  padding: 0.9rem;
  border-radius: 12px;
  background: var(--surface-soft);
}

.route-endpoints dt {
  color: var(--ink-500);
  font-size: 0.82rem;
  font-weight: 750;
}

.route-endpoints dd {
  margin: 0.3rem 0 0;
  font-weight: 700;
}

:deep(.map-pin-shell) {
  background: transparent;
  border: 0;
}

:deep(.map-pin) {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 3px solid #fff;
  border-radius: 50%;
  color: #fff;
  background: var(--pin-colour);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
  font-weight: 850;
}

@media (max-width: 900px) {
  .map-layout {
    grid-template-columns: 1fr;
  }

  .map-canvas {
    min-height: 420px;
  }

  .route-endpoints {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 560px) {
  .map-card-heading,
  .route-heading-row {
    flex-direction: column;
  }

  .map-state,
  .route-actions {
    align-self: flex-start;
  }

  .route-endpoints {
    grid-template-columns: 1fr;
  }

  .map-canvas {
    min-height: 360px;
  }
}
</style>
