import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import HomeView from '@/views/HomeView.vue'

const LoginView = () => import('@/views/LoginView.vue')
const TablesView = () => import('@/views/TablesView.vue')
const EmailView = () => import('@/views/EmailView.vue')
const NotFoundView = () => import('@/views/NotFoundView.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/tables', name: 'tables', component: TablesView, meta: { requiresAuth: true } },
    { path: '/email', name: 'email', component: EmailView, meta: { requiresAuth: true } },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView },
  ],
})

router.beforeEach(async (to) => {
  const { user, waitForAuthReady } = useAuth()
  await waitForAuthReady()

  if (to.meta.requiresAuth && !user.value) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.name === 'login' && user.value) {
    const redirect = typeof to.query.redirect === 'string' ? to.query.redirect : '/tables'
    return redirect
  }

  return true
})

export default router
