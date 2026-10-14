<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FormMessage from '@/components/FormMessage.vue'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const router = useRouter()
const { configured, loading, error: authError, register, login, clearError } = useAuth()

const mode = ref('login')
const form = reactive({ email: '', password: '' })
const errors = reactive({ email: '', password: '' })
const successMessage = ref('')

const heading = computed(() => (mode.value === 'login' ? 'Welcome back' : 'Create your account'))
const submitLabel = computed(() => (mode.value === 'login' ? 'Sign in' : 'Register'))

function validate() {
  errors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ? ''
    : 'Enter a valid email address.'
  errors.password = form.password.length >= 6 ? '' : 'Use at least six characters.'
  return !errors.email && !errors.password
}

function switchMode() {
  mode.value = mode.value === 'login' ? 'register' : 'login'
  successMessage.value = ''
  clearError()
}

async function submit() {
  successMessage.value = ''
  clearError()
  if (!validate() || !configured) return

  try {
    if (mode.value === 'register') {
      await register(form.email.trim(), form.password)
      successMessage.value = 'Your account is ready. You are now signed in.'
    } else {
      await login(form.email.trim(), form.password)
    }

    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/tables'
    await router.replace(redirect)
  } catch {
    // The shared auth composable exposes a safe user-facing message.
  }
}
</script>

<template>
  <section class="auth-layout">
    <div class="auth-copy">
      <p class="eyebrow">Member access</p>
      <h1>{{ heading }}</h1>
      <p class="lede">
        Sign in to explore climate resources, community opportunities and secure email tools.
      </p>
      <ul class="benefit-list">
        <li><i class="pi pi-check" aria-hidden="true"></i> Secure Firebase authentication</li>
        <li><i class="pi pi-check" aria-hidden="true"></i> Protected member-only tools</li>
        <li><i class="pi pi-check" aria-hidden="true"></i> Clear and simple learning support</li>
      </ul>
    </div>

    <form class="auth-card card" novalidate @submit.prevent="submit">
      <div class="form-title">
        <h2>{{ submitLabel }}</h2>
        <p>{{ mode === 'login' ? 'Use your member details.' : 'Register with an email and password.' }}</p>
      </div>

      <FormMessage
        v-if="!configured"
        type="info"
        message="Firebase setup is required before authentication can be used. Add the values listed in .env.example."
      />
      <FormMessage v-if="authError" type="error" :message="authError" />
      <FormMessage v-if="successMessage" type="success" :message="successMessage" />

      <div class="field">
        <label for="email">Email address</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          autocomplete="email"
          :aria-invalid="Boolean(errors.email)"
          aria-describedby="email-error"
        />
        <p v-if="errors.email" id="email-error" class="field-error">{{ errors.email }}</p>
      </div>

      <div class="field">
        <label for="password">Password</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
          :aria-invalid="Boolean(errors.password)"
          aria-describedby="password-error password-help"
        />
        <p id="password-help" class="field-help">Minimum six characters.</p>
        <p v-if="errors.password" id="password-error" class="field-error">{{ errors.password }}</p>
      </div>

      <button class="primary-button submit-button" type="submit" :disabled="loading || !configured">
        <i v-if="loading" class="pi pi-spin pi-spinner" aria-hidden="true"></i>
        {{ loading ? 'Please wait…' : submitLabel }}
      </button>

      <button class="text-button mode-button" type="button" :disabled="loading" @click="switchMode">
        {{ mode === 'login' ? 'New here? Create an account' : 'Already registered? Sign in' }}
      </button>
    </form>
  </section>
</template>

<style scoped>
.auth-layout {
  min-height: 620px;
  display: grid;
  grid-template-columns: 1fr minmax(320px, 480px);
  align-items: center;
  gap: clamp(2rem, 8vw, 7rem);
}

.auth-copy {
  max-width: 600px;
}

.benefit-list {
  display: grid;
  gap: 0.75rem;
  margin: 1.7rem 0 0;
  padding: 0;
  list-style: none;
  color: var(--ink-700);
  font-weight: 650;
}

.benefit-list i {
  margin-right: 0.5rem;
  color: var(--success);
}

.auth-card {
  display: grid;
  gap: 1.2rem;
  padding: clamp(1.4rem, 4vw, 2.2rem);
}

.form-title p,
.field-help {
  color: var(--ink-500);
}

.form-title p,
.field-help {
  margin-bottom: 0;
}

.field-help {
  font-size: 0.85rem;
}

.submit-button {
  width: 100%;
}

.mode-button {
  justify-self: center;
}

@media (max-width: 760px) {
  .auth-layout {
    min-height: auto;
    grid-template-columns: 1fr;
  }
}
</style>
