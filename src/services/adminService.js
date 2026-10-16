import { httpsCallable } from 'firebase/functions'
import { firebaseConfigured, functions } from '@/services/firebase'

export const adminToolsConfigured = firebaseConfigured && Boolean(functions)

function requireFunctions() {
  if (!adminToolsConfigured || !functions) {
    throw new Error('Firebase administrator tools are not configured.')
  }
  return functions
}

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

export async function listMembers() {
  const call = httpsCallable(requireFunctions(), 'listMembers')
  const response = await call({})
  return Array.isArray(response.data?.members) ? response.data.members : []
}

export async function deleteMember(uid) {
  const call = httpsCallable(requireFunctions(), 'deleteMember')
  const response = await call({ uid: String(uid).trim() })
  return response.data
}

export async function sendMemberEmail({ recipientUids, subject, message, attachment }) {
  const call = httpsCallable(requireFunctions(), 'sendEmailWithAttachment')
  const payload = {
    recipientUids: recipientUids.map((uid) => String(uid).trim()),
    subject: String(subject).trim(),
    message: String(message).trim(),
  }

  if (attachment) {
    payload.attachment = {
      content: await fileToBase64(attachment),
      filename: attachment.name,
      type: attachment.type,
      size: attachment.size,
    }
  }

  const response = await call(payload)
  return response.data
}
