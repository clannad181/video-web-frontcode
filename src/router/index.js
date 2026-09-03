import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/client/video/:videoUid/episode/:episodeUid',
    name: 'VideoPlay',
    component: () => import('../views/VideoPlayView.vue')
  },
  {
    path: '/category',
    name: 'Category',
    component: () => import('../views/CategoryView.vue')
  },
  {
    path: '/category/:id',
    name: 'CategoryDetail',
    component: () => import('../views/CategoryView.vue')
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('../views/SearchView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { hideLayout: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue'),
    meta: { hideLayout: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/up/:uid',
    name: 'UpProfile',
    component: () => import('../views/UpProfileView.vue')
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('../views/HistoryView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/contribution',
    name: 'Contribution',
    component: () => import('../views/ContributionView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/contribution/episodes/:videoUid',
    name: 'EpisodeManagement',
    component: () => import('../views/EpisodeManagementView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:catchAll(.*)',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue'),
    meta: { hideLayout: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
