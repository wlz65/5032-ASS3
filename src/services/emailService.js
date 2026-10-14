import { httpsCallable } from 'firebase/functions'
import { firebaseConfigured, functions } from '@/services/firebase'

export const emailConfigured = firebaseConfigured && Boolean(functions)

export const emailSetupMessage = emailConfigured
  ? ''
  : 'Firebase is not configured yet. Add the VITE_FIREBASE_* values listed in .env.example.'

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('The attachment could not be read.'))
    reader.onload = () => {
      const [, content = ''] = String(reader.result).split(',', 2)
      resolve(content)
    }
    reader.readAsDataURL(file)
  })
}

export async function sendEmailWithAttachment({ to, subject, message, attachment }) {
  if (!emailConfigured || !functions) throw new Error(emailSetupMessage)

  const sendEmail = httpsCallable(functions, 'sendEmailWithAttachment')
  const response = await sendEmail({
    to: String(to).trim(),
    subject: String(subject).trim(),
    message: String(message).trim(),
    attachment: {
      content: await fileToBase64(attachment),
      filename: attachment.name,
      type: attachment.type,
      size: attachment.size,
    },
  })

  return response.data
}
