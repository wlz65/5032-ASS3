import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { auth, firebaseSetupMessage } from './firebase'

function requireAuth() {
  if (!auth) {
    throw new Error(firebaseSetupMessage)
  }

  return auth
}

export function registerWithEmail(email, password) {
  return createUserWithEmailAndPassword(requireAuth(), email, password)
}

export function signInWithEmail(email, password) {
  return signInWithEmailAndPassword(requireAuth(), email, password)
}

export function signInWithGoogle() {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  return signInWithPopup(requireAuth(), provider)
}

export function signOutUser() {
  return firebaseSignOut(requireAuth())
}
