const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024
const ALLOWED_ATTACHMENT_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'text/plain',
])

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim())
}

function validateEmailRequest(data) {
  const errors = []
  const attachment = data?.attachment

  if (!isValidEmail(data?.to)) errors.push('Invalid recipient email.')
  if (!String(data?.subject || '').trim() || String(data.subject).length > 120) {
    errors.push('Invalid email subject.')
  }
  if (!String(data?.message || '').trim() || String(data.message).length > 5000) {
    errors.push('Invalid email message.')
  }
  if (!attachment || typeof attachment.content !== 'string') {
    errors.push('Attachment is required.')
  } else {
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
  isValidEmail,
  safeFilename,
  validateEmailRequest,
}
