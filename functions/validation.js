const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024
const ALLOWED_ATTACHMENT_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'text/plain',
])
const MAX_RECIPIENTS = 50

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim())
}

function validateEmailRequest(data) {
  const errors = []
  const attachment = data?.attachment
  const recipientUids = data?.recipientUids

  if (!Array.isArray(recipientUids) || recipientUids.length < 1 || recipientUids.length > MAX_RECIPIENTS) {
    errors.push(`Choose between 1 and ${MAX_RECIPIENTS} members.`)
  } else {
    const cleanedUids = recipientUids.map((uid) => String(uid || '').trim())
    if (cleanedUids.some((uid) => !uid || uid.length > 128)) {
      errors.push('Invalid member selection.')
    }
    if (new Set(cleanedUids).size !== cleanedUids.length) {
      errors.push('Member selections must be unique.')
    }
  }
  if (!String(data?.subject || '').trim() || String(data.subject).length > 120) {
    errors.push('Invalid email subject.')
  }
  if (!String(data?.message || '').trim() || String(data.message).length > 5000) {
    errors.push('Invalid email message.')
  }
  if (attachment != null) {
    if (typeof attachment.content !== 'string' || !attachment.content) {
      errors.push('Invalid attachment content.')
    }
    if (!ALLOWED_ATTACHMENT_TYPES.has(attachment.type)) errors.push('Unsupported attachment type.')
    if (!Number.isFinite(attachment.size) || attachment.size <= 0 || attachment.size > MAX_ATTACHMENT_BYTES) {
      errors.push('Invalid attachment size.')
    }
    const estimatedBytes = Math.floor((attachment.content.length * 3) / 4)
    if (estimatedBytes > MAX_ATTACHMENT_BYTES + 2) errors.push('Attachment is too large.')
  }

  return errors
}

function safeFilename(value) {
  const cleaned = String(value || 'attachment').replace(/[^a-zA-Z0-9._ -]/g, '_').slice(0, 100)
  return cleaned || 'attachment'
}

module.exports = {
  ALLOWED_ATTACHMENT_TYPES,
  MAX_ATTACHMENT_BYTES,
  MAX_RECIPIENTS,
  isValidEmail,
  safeFilename,
  validateEmailRequest,
}
