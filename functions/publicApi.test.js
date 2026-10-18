const test = require('node:test')
const assert = require('node:assert/strict')
const { filterRecords, handleClimateDataApi, routeFromPath } = require('./publicApi')

function createResponse() {
  return {
    headers: {},
    statusCode: 0,
    body: null,
    set(name, value) {
      this.headers[name] = value
      return this
    },
    status(code) {
      this.statusCode = code
      return this
    },
    json(body) {
      this.body = body
      return this
    },
  }
}

test('routeFromPath accepts direct and hosting-style API routes', () => {
  assert.equal(routeFromPath('/resources/'), '/resources')
  assert.equal(routeFromPath('/api/events'), '/events')
})

test('filterRecords applies case-insensitive public filters', () => {
  const records = [{ difficulty: 'Beginner' }, { difficulty: 'Advanced' }]
  assert.deepEqual(filterRecords(records, ['difficulty'], { difficulty: 'begin' }), [records[0]])
})

test('resources route returns filtered records', () => {
  const response = createResponse()
  handleClimateDataApi(
    { method: 'GET', path: '/resources', query: { difficulty: 'Advanced' } },
    response,
  )
  assert.equal(response.statusCode, 200)
  assert.equal(response.body.count, 3)
  assert.ok(response.body.items.every((item) => item.difficulty === 'Advanced'))
})

test('unsupported methods return 405', () => {
  const response = createResponse()
  handleClimateDataApi({ method: 'POST', path: '/events', query: {} }, response)
  assert.equal(response.statusCode, 405)
  assert.equal(response.headers.Allow, 'GET')
})
