const { climateResources, communityEvents } = require('./publicData')

const RESOURCE_FILTERS = ['topic', 'audience', 'format', 'difficulty']
const EVENT_FILTERS = ['type', 'location', 'audience', 'availability']

function matchesFilter(record, field, rawValue) {
  if (typeof rawValue !== 'string' || !rawValue.trim()) return true
  const query = rawValue.trim().slice(0, 100).toLocaleLowerCase('en-AU')
  return String(record[field] || '')
    .toLocaleLowerCase('en-AU')
    .includes(query)
}

function filterRecords(records, fields, query = {}) {
  return records.filter((record) =>
    fields.every((field) => matchesFilter(record, field, query[field])),
  )
}

function routeFromPath(path = '/') {
  const withoutApiPrefix = path.replace(/^\/api(?=\/|$)/, '')
  const normalised = withoutApiPrefix.replace(/\/+$/, '')
  return normalised || '/'
}

function handleClimateDataApi(request, response) {
  response.set('Cache-Control', 'public, max-age=300')

  if (request.method !== 'GET') {
    response.set('Allow', 'GET')
    return response.status(405).json({ error: 'Only GET requests are supported.' })
  }

  const route = routeFromPath(request.path)

  if (route === '/') {
    return response.status(200).json({
      name: 'MClimateWise Mel public data API',
      routes: ['/resources', '/events'],
    })
  }

  if (route === '/resources') {
    const items = filterRecords(climateResources, RESOURCE_FILTERS, request.query)
    return response.status(200).json({ count: items.length, items })
  }

  if (route === '/events') {
    const items = filterRecords(communityEvents, EVENT_FILTERS, request.query)
    return response.status(200).json({ count: items.length, items })
  }

  return response.status(404).json({ error: 'Route not found. Use /resources or /events.' })
}

module.exports = { filterRecords, handleClimateDataApi, routeFromPath }
