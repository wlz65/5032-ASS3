const test = require('node:test')
const assert = require('node:assert/strict')
const { memberSummary, requireAdmin } = require('./admin')

test('requireAdmin rejects signed-out and ordinary callers', () => {
  assert.throws(() => requireAdmin({}), (error) => error.code === 'unauthenticated')
  assert.throws(
    () => requireAdmin({ auth: { uid: 'member-1', token: {} } }),
    (error) => error.code === 'permission-denied',
  )
})

test('requireAdmin returns the authenticated administrator uid', () => {
  assert.equal(requireAdmin({ auth: { uid: 'admin-1', token: { admin: true } } }), 'admin-1')
})

test('memberSummary returns only approved member fields', () => {
  const summary = memberSummary({
    uid: 'member-1',
    email: 'member@example.org',
    emailVerified: true,
    disabled: false,
    passwordHash: 'hidden',
    passwordSalt: 'hidden',
    customClaims: { admin: false },
    metadata: { creationTime: 'created', lastSignInTime: 'signed-in' },
  })

  assert.deepEqual(summary, {
    uid: 'member-1',
    email: 'member@example.org',
    emailVerified: true,
    disabled: false,
    creationTime: 'created',
    lastSignInTime: 'signed-in',
  })
  assert.equal('passwordHash' in summary, false)
  assert.equal('passwordSalt' in summary, false)
  assert.equal('customClaims' in summary, false)
})
