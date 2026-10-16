const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { defineSecret } = require('firebase-functions/params')
const { setGlobalOptions } = require('firebase-functions/v2')
const logger = require('firebase-functions/logger')
const { getApps, initializeApp } = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')
const nodemailer = require('nodemailer')
const { memberSummary, requireAdmin } = require('./admin')
const { safeFilename, validateEmailRequest } = require('./validation')

if (!getApps().length) initializeApp()

const gmailAppPassword = defineSecret('GMAIL_APP_PASSWORD')
const SENDER_EMAIL = 'a2067669103@gmail.com'

setGlobalOptions({ region: 'australia-southeast1', maxInstances: 3 })

async function readAllUsers() {
  const users = []
  let pageToken

  do {
    const page = await getAuth().listUsers(1000, pageToken)
    users.push(...page.users)
    pageToken = page.pageToken
  } while (pageToken)

  return users
}

exports.listMembers = onCall(async (request) => {
  requireAdmin(request)
  const users = await readAllUsers()
  const members = users
    .filter((user) => user.email && user.customClaims?.admin !== true)
    .map(memberSummary)
    .sort((left, right) => left.email.localeCompare(right.email))

  return { members }
})

exports.deleteMember = onCall(async (request) => {
  const adminUid = requireAdmin(request)
  const uid = String(request.data?.uid || '').trim()

  if (!uid || uid.length > 128) {
    throw new HttpsError('invalid-argument', 'Choose a valid member account.')
  }
  if (uid === adminUid) {
    throw new HttpsError('failed-precondition', 'Administrators cannot delete their own account.')
  }

  let target
  try {
    target = await getAuth().getUser(uid)
  } catch (error) {
    if (error?.code === 'auth/user-not-found') {
      throw new HttpsError('not-found', 'The selected member no longer exists.')
    }
    throw error
  }

  if (target.customClaims?.admin === true) {
    throw new HttpsError('failed-precondition', 'Administrator accounts cannot be deleted here.')
  }

  await getAuth().deleteUser(uid)
  logger.info('Member account deleted by administrator', { adminUid, deletedUid: uid })
  return { success: true, deletedUid: uid }
})

exports.sendEmailWithAttachment = onCall(
  { secrets: [gmailAppPassword], timeoutSeconds: 120 },
  async (request) => {
    const adminUid = requireAdmin(request)
    const errors = validateEmailRequest(request.data)
    if (errors.length) {
      throw new HttpsError('invalid-argument', errors[0])
    }

    const { recipientUids, subject, message, attachment } = request.data
    const identifiers = recipientUids.map((uid) => ({ uid: String(uid).trim() }))
    const result = await getAuth().getUsers(identifiers)

    if (result.notFound.length || result.users.length !== identifiers.length) {
      throw new HttpsError('failed-precondition', 'One or more selected members no longer exist.')
    }
    if (result.users.some((user) => !user.email || user.customClaims?.admin === true)) {
      throw new HttpsError('failed-precondition', 'Only registered member accounts can receive this email.')
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: SENDER_EMAIL,
        pass: gmailAppPassword.value(),
      },
    })
    const attachments = attachment
      ? [
          {
            filename: safeFilename(attachment.filename),
            content: Buffer.from(attachment.content, 'base64'),
            contentType: attachment.type || 'application/octet-stream',
          },
        ]
      : []

    let successCount = 0
    let failureCount = 0

    for (const member of result.users) {
      try {
        await transporter.sendMail({
          from: `"MClimateWise Mel" <${SENDER_EMAIL}>`,
          to: member.email,
          subject: String(subject).trim(),
          text: String(message).trim(),
          attachments,
        })
        successCount += 1
      } catch (error) {
        failureCount += 1
        logger.error('Administrator member email failed', {
          code: error?.code,
          response: error?.response || error?.message,
          adminUid,
          memberUid: member.uid,
        })
      }
    }

    return { successCount, failureCount }
  },
)
