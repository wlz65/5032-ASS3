<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { user, isAdmin, loading, logout } = useAuth()

const userLabel = computed(() => user.value?.email ?? '')

async function handleLogout() {
  const confirmed = window.confirm('Are you sure you want to sign out?')
  if (!confirmed) return

  await logout()
  await router.push('/')
}
</script>

<template>
  <header class="site-header">
    <a class="skip-link" href="#main-content">Skip to main content</a>
    <nav class="nav-shell" aria-label="Primary navigation">
      <RouterLink
        class="brand"
        :to="isAdmin ? '/admin' : '/'"
        :aria-label="isAdmin ? 'MClimateWise Mel admin' : 'MClimateWise Mel home'"
      >
        <span class="brand-mark" aria-hidden="true"><i class="pi pi-sun"></i></span>
        <span>
          <strong>MClimateWise</strong>
          <small>Melbourne climate learning</small>
        </span>
      </RouterLink>

      <div class="nav-links">
        <RouterLink v-if="user && isAdmin" to="/admin">Admin</RouterLink>
        <template v-else>
          <RouterLink to="/">Home</RouterLink>
          <RouterLink v-if="user" to="/tables">Explore data</RouterLink>
          <RouterLink v-if="user" to="/map">Map &amp; route</RouterLink>
          <RouterLink v-if="user" to="/quiz">Climate quiz</RouterLink>
        </template>
      </div>

      <div class="account-area">
        <template v-if="user">
          <span class="user-email" :title="userLabel">{{ userLabel }}</span>
          <button
            class="secondary-button compact"
            type="button"
            :disabled="loading"
            @click="handleLogout"
          >
            Sign out
          </button>
        </template>
        <RouterLink v-else class="primary-button login-link" to="/login">Sign in</RouterLink>
      </div>
    </nav>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 20;
  border-bottom: 1px solid rgba(216, 228, 224, 0.92);
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(14px);
}

.skip-link {
  position: absolute;
  left: 1rem;
  top: -5rem;
  z-index: 40;
  padding: 0.7rem 1rem;
  border-radius: 8px;
  color: #fff;
  background: var(--brand-950);
}

.skip-link:focus {
  top: 0.75rem;
}

.nav-shell {
  width: min(1180px, calc(100% - 2rem));
  min-height: 76px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 2rem;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  text-decoration: none;
}

.brand-mark {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  color: #fff;
  border-radius: 13px;
  background: linear-gradient(145deg, var(--brand-800), #43a36f);
}

.brand strong,
.brand small {
  display: block;
}

.brand strong {
  color: var(--brand-950);
}

.brand small {
  color: var(--ink-500);
  font-size: 0.72rem;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.nav-links a {
  padding: 0.55rem 0.75rem;
  border-radius: 8px;
  color: var(--ink-700);
  font-weight: 700;
  text-decoration: none;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: var(--brand-800);
  background: var(--brand-100);
}

.account-area {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-email {
  max-width: 190px;
  overflow: hidden;
  color: var(--ink-500);
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.86rem;
}

.compact,
.login-link {
  min-height: 38px;
  padding: 0.45rem 0.8rem;
}

.login-link {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
}

@media (max-width: 820px) {
  .nav-shell {
    grid-template-columns: 1fr auto;
    gap: 0.75rem;
    padding: 0.75rem 0;
  }

  .nav-links {
    grid-column: 1 / -1;
    grid-row: 2;
    overflow-x: auto;
  }

  .user-email {
    display: none;
  }
}

@media (max-width: 480px) {
  .nav-shell {
    width: calc(100% - 1rem);
  }

  .brand small {
    display: none;
  }
}
</style>
