import { createRouter, createWebHistory } from 'vue-router'
import Auth from '@/pages/Auth.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/pages/Home.vue'),
    },
    {
      path: '/auth',
      name: 'Auth',
      component: Auth,
    },
  ],
})

export default router
