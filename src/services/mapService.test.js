import assert from 'node:assert/strict'
import test from 'node:test'
import { normalisePlaceResults, normaliseRouteResponse } from './mapService.js'

test('normalisePlaceResults keeps valid public place data', () => {
  const results = normalisePlaceResults([
    {
      place_id: 10,
      display_name: 'Federation Square',
      lat: '-37.8179',
      lon: '144.9691',
      type: 'square',
    },
    { place_id: 11, display_name: 'Invalid', lat: 'unknown', lon: '144.9', type: 'place' },
  ])

  assert.deepEqual(results, [
    {
      id: '10',
      name: 'Federation Square',
      latitude: -37.8179,
      longitude: 144.9691,
      type: 'square',
    },
  ])
})

test('normaliseRouteResponse converts coordinates, distance and duration', () => {
  const route = normaliseRouteResponse({
    code: 'Ok',
    routes: [
      {
        distance: 2450,
        duration: 725,
        geometry: {
          coordinates: [
            [144.96, -37.81],
            [144.98, -37.83],
          ],
        },
      },
    ],
  })

  assert.deepEqual(route, {
    coordinates: [
      [-37.81, 144.96],
      [-37.83, 144.98],
    ],
    distanceKm: 2.5,
    durationMinutes: 12,
  })
})

test('normaliseRouteResponse rejects a missing route', () => {
  assert.throws(
    () => normaliseRouteResponse({ code: 'NoRoute', routes: [] }),
    /No driving route was found/,
  )
})
