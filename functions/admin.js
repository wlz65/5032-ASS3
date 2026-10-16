const { HttpsError } = require('firebase-functions/v2/https')

function requireAdmin(request) {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Sign in before using administrator tools.')
  }
  if (request.auth.token?.admin !== true) {
    throw new HttpsError('permission-denied', 'Administrator access is required.')
  }
  return request.auth.uid
}

function memberSummary(user) {
  return {
    uid: user.uid,
    email: user.email,
    emailVerified: Boolean(user.emailVerified),
    disabled: Boolean(user.disabled),
    creationTime: user.metadata?.creationTime || '',
    lastSignInTime: user.metadata?.lastSignInTime || null,
  }
}

module.exports = { memberSummary, requireAdmin }
