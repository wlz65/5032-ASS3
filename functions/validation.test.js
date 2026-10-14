const test = require('node:test')
const assert = require('node:assert/strict')
const { safeFilename, validateEmailRequest } = require('./validation')

const validRequest = {
  to: 'learner@example.org',
  subject: 'Climate resource',
  message: 'A short learning resource.',
  attachment: {
    content: Buffer.from('hello').toString('base64'),
    filename: 'resource.txt',
    type: 'text/plain',
    size: 5,
  },
}

test('accepts a valid email request', () => {
  assert.deepEqual(validateEmailRequest(validRequest), [])
})

test('rejects invalid recipient and attachment type', () => {
  const request = {
    ...validRequest,
    to: 'not-an-email',
    attachment: { ...validRequest.attachment, type: 'application/javascript' },
  }
  assert.equal(validateEmailRequest(request).length, 2)
})

test('sanitises attachment filenames', () => {
  assert.equal(safeFilename('../unsafe<script>.txt'), '.._unsafe_script_.txt')
})
