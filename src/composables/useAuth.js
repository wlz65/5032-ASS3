import { readonly, ref, shallowRef } from 'vue'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, firebaseSetupMessage } from '@/services/firebase'
import { registerWithEmail, signInWithEmail, signOutUser } from '@/services/authService'

const user = shallowRef(null)
const isAdmin = ref(false)
const loading = ref(true)
const error = ref('')

let resolveReady
const readyPromise = new Promise((resolve) => {
  resolveReady = resolve
})

if (auth) {
  onAuthStateChanged(
    auth,
    async (nextUser) => {
      user.value = nextUser
      isAdmin.value = false

      try {
        if (nextUser) {
          const tokenResult = await nextUser.getIdTokenResult()
          isAdmin.value = tokenResult.claims.admin === true
        }
      } catch {
        error.value = 'We could not confirm your account permissions. Please sign in again.'
      } finally {
        loading.value = false
        resolveReady(nextUser)
      }
    },
    () => {
      error.value = 'We could not confirm your sign-in status. Please refresh and try again.'
      isAdmin.value = false
      loading.value = false
      resolveReady(null)
    },
  )
} else {
  error.value = firebaseSetupMessage
  loading.value = false
  resolveReady(null)
}

const errorMessages = {
  'auth/email-already-in-use': 'An account already exists for this email address.',
  'auth/invalid-credential': 'The email or password is incorrect.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/too-many-requests': 'Too many attempts. Wait a moment before trying again.',
  'auth/weak-password': 'Use a password with at least six characters.',
}

function friendlyAuthError(authError) {
  return errorMessages[authError?.code] || authError?.message || 'Authentication failed. Please try again.'
}

async function runAuthAction(action) {
  loading.value = true
  error.value = ''

  try {
    return await action()
  } catch (authError) {
    error.value = friendlyAuthError(authError)
    throw authError
  } finally {
    loading.value = false
  }
}

export function useAuth() {
  return {
    user: readonly(user),
    isAdmin: readonly(isAdmin),
    loading: readonly(loading),
    error: readonly(error),
    configured: Boolean(auth),
    waitForAuthReady: () => readyPromise,
    clearError: () => {
      error.value = ''
    },
    register: (email, password) =>
      runAuthAction(async () => {
        const credential = await registerWithEmail(email, password)
        user.value = credential.user
        return credential
      }),
    login: (email, password) =>
      runAuthAction(async () => {
        const credential = await signInWithEmail(email, password)
        user.value = credential.user
        return credential
      }),
    logout: () => runAuthAction(() => signOutUser()),
  }
}
