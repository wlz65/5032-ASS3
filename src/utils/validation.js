export const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024
export const ALLOWED_ATTACHMENT_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'text/plain']

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim())
}

export function validateEmailForm({ to, subject, message, attachment }) {
  const errors = {}

  if (!isValidEmail(to)) errors.to = 'Enter a valid recipient email address.'
  if (!String(subject).trim()) errors.subject = 'Enter an email subject.'
  if (!String(message).trim()) errors.message = 'Enter an email message.'

  if (!attachment) {
    errors.attachment = 'Choose one attachment.'
  } else if (!ALLOWED_ATTACHMENT_TYPES.includes(attachment.type)) {
    errors.attachment = 'Use a PDF, PNG, JPEG or TXT file.'
  } else if (attachment.size > MAX_ATTACHMENT_BYTES) {
    errors.attachment = 'The attachment must be 2 MB or smaller.'
  }

  return errors
}

export function validateAdminEmailForm({ recipientUids, subject, message, attachment }) {
  const errors = {}

  if (!Array.isArray(recipientUids) || recipientUids.length < 1) {
    errors.recipients = 'Select at least one registered member.'
  } else if (recipientUids.length > 50) {
    errors.recipients = 'Select no more than 50 members at a time.'
  }
  if (!String(subject).trim()) errors.subject = 'Enter an email subject.'
  if (String(subject).length > 120) errors.subject = 'Use 120 characters or fewer.'
  if (!String(message).trim()) errors.message = 'Enter an email message.'
  if (String(message).length > 5000) errors.message = 'Use 5000 characters or fewer.'

  if (attachment && !ALLOWED_ATTACHMENT_TYPES.includes(attachment.type)) {
    errors.attachment = 'Use a PDF, PNG, JPEG or TXT file.'
  } else if (attachment && attachment.size > MAX_ATTACHMENT_BYTES) {
    errors.attachment = 'The attachment must be 2 MB or smaller.'
  }

  return errors
}
