const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { defineSecret } = require('firebase-functions/params')
const { setGlobalOptions } = require('firebase-functions/v2')
const logger = require('firebase-functions/logger')
const nodemailer = require('nodemailer')
const { safeFilename, validateEmailRequest } = require('./validation')

const gmailAppPassword = defineSecret('GMAIL_APP_PASSWORD')
const SENDER_EMAIL = 'a2067669103@gmail.com'

setGlobalOptions({ region: 'australia-southeast1', maxInstances: 3 })

exports.sendEmailWithAttachment = onCall(
  { secrets: [gmailAppPassword] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Sign in before sending an email.')
    }

    const errors = validateEmailRequest(request.data)
    if (errors.length) {
      throw new HttpsError('invalid-argument', errors[0])
    }

    const { to, subject, message, attachment } = request.data
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: SENDER_EMAIL,
          pass: gmailAppPassword.value(),
        },
      })

      await transporter.sendMail({
        from: `"MClimateWise Mel" <${SENDER_EMAIL}>`,
        to: String(to).trim(),
        subject: String(subject).trim(),
        text: String(message).trim(),
        attachments: [
          {
            filename: safeFilename(attachment.filename),
            content: Buffer.from(attachment.content, 'base64'),
            contentType: attachment.type || 'application/octet-stream',
          },
        ],
      })
    } catch (error) {
      logger.error('Gmail SMTP email failed', {
        code: error?.code,
        response: error?.response || error?.message,
        uid: request.auth.uid,
      })
      throw new HttpsError('internal', 'The email service could not send this message.')
    }

    return { success: true, message: 'Email sent successfully.' }
  },
)
