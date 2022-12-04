import { createRouter, createWebHistory } from 'vue-router'
import Auth from '@/pages/Auth.vue'
import Home from '@/pages/Home.vue'
import { supabase } from '@/supabase'
import { getOneWithId } from '@/utils/dbQueries'

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
      path: '/products/:category/:id',
      name: 'CategoryProducts',
      component: () => import('@/pages/CategoryProducts.vue'),
    },
    {
      path: '/admin',
      name: 'AdminHome',
      component: () => import('@/pages/Admin/AdminWrapper.vue'),
      meta: { auth: true },
    },
    {
      path: '/admin/:link',
      name: 'Admin',
      component: () => import('@/pages/Admin/AdminWrapper.vue'),
      meta: { auth: true },
    },
    {
      path: '/admin/product/:link/:id',
      name: 'AdminCreateProducts',
      component: () => import('@/pages/Admin/AdminWrapper.vue'),
      meta: { auth: true },
    },

    {
      path: '/admin/edit/:category/:categoryId/:id',
      name: 'EditProducts',
      component: () => import('@/pages/Admin/EditProducts.vue'),
      meta: { auth: true },
    },
    {
      path: '/admin/edit/:categoryId',
      name: 'EditCategory',
      component: () => import('@/pages/Admin/EditCategory.vue'),
      meta: { auth: true },
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const requireAuth = to.matched.some((record) => record.meta.auth)
  const token = JSON.parse(localStorage.getItem('supabase.auth.token') || '{}')
    ?.currentSession?.access_token
  if (requireAuth && !token) return next('/')
  const user = supabase.auth.user()
  let role = 1
  if (user) {
    const { data } = await getOneWithId<{ role: number }>(
      'users',
      user.id,
      'role'
    )
    if (data) role = data.role
  }
  if (requireAuth && role !== 0) {
    next('/')
  } else {
    next()
  }
})

export default router
