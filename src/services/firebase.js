import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFunctions } from 'firebase/functions'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId']

export const firebaseConfigured = requiredKeys.every((key) => Boolean(firebaseConfig[key]))

export const firebaseApp = firebaseConfigured ? initializeApp(firebaseConfig) : null
export const auth = firebaseApp ? getAuth(firebaseApp) : null
export const functions = firebaseApp ? getFunctions(firebaseApp, 'australia-southeast1') : null

export const firebaseSetupMessage = firebaseConfigured
  ? ''
  : 'Firebase is not configured yet. Add the VITE_FIREBASE_* values from .env.example to a local .env file.'
