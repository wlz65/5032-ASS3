const test = require('node:test')
const assert = require('node:assert/strict')
const { safeFilename, validateEmailRequest } = require('./validation')

const validRequest = {
  recipientUids: ['member-1'],
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

test('accepts a valid request without an attachment', () => {
  const request = { ...validRequest }
  delete request.attachment
  assert.deepEqual(validateEmailRequest(request), [])
})

test('rejects invalid member selection and attachment type', () => {
  const request = {
    ...validRequest,
    recipientUids: [],
    attachment: { ...validRequest.attachment, type: 'application/javascript' },
  }
  assert.equal(validateEmailRequest(request).length, 2)
})

test('rejects duplicate members', () => {
  const request = { ...validRequest, recipientUids: ['member-1', 'member-1'] }
  assert.deepEqual(validateEmailRequest(request), ['Member selections must be unique.'])
})

test('rejects more than 50 members', () => {
  const request = {
    ...validRequest,
    recipientUids: Array.from({ length: 51 }, (_, index) => `member-${index}`),
  }
  assert.deepEqual(validateEmailRequest(request), ['Choose between 1 and 50 members.'])
})

test('sanitises attachment filenames', () => {
  assert.equal(safeFilename('../unsafe<script>.txt'), '.._unsafe_script_.txt')
})
