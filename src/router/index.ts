import { createRouter, createWebHistory } from 'vue-router'
import Auth from '@/pages/Auth.vue'
import Home from '@/pages/Home.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
    },
    {
      path: '/auth',
      name: 'Auth',
      component: Auth,
    },
    {
      path: '/admin',
      name: 'AdminHome',
      component: () => import('@/pages/Admin/AdminHome.vue'),
    },
    {
      path: '/admin/category',
      name: 'AdminCategory',
      component: () => import('@/pages/Admin/AdminCategory.vue'),
    },
  ],
})

export default router
