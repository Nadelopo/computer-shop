import { createRouter, createWebHistory } from 'vue-router'
import Auth from '@/pages/Auth.vue'
import Home from '@/pages/Home.vue'
import { supabase } from '@/supabase'
import { getOneById } from '@/utils/queries/db'
import type { UserRead } from '@/types/tables/users.types'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/auth',
      name: 'Auth',
      component: Auth
    },
    {
      path: '/products/:category/:id',
      name: 'CategoryProducts',
      component: () => import('@/pages/CategoryProducts.vue')
    },
    {
      path: '/admin',
      name: 'AdminHome',
      component: () => import('@/pages/Admin/AdminHome.vue'),
      meta: { auth: true },
      children: [
        {
          path: 'categories',
          name: 'AdminCategories',
          component: () => import('@/pages/Admin/AdminCategories.vue')
        },
        {
          path: 'products/:category/:id',
          name: 'AdminProducts',
          component: () => import('@/pages/Admin//AdminProducts.vue')
        },
        {
          path: 'manufacturers',
          name: 'AdminManufacturers',
          component: () => import('@/pages/Admin//AdminManufacturers.vue')
        },
        {
          path: 'Specifications',
          name: 'AdminSpecifications',
          component: () => import('@/pages/Admin//AdminSpecifications.vue')
        }
      ]
    },
    {
      path: '/admin/edit/:category/:categoryId/:id',
      name: 'EditProducts',
      component: () => import('@/pages/Admin/EditProducts.vue'),
      meta: { auth: true }
    },
    {
      path: '/admin/edit/category/:id',
      name: 'EditCategory',
      component: () => import('@/pages/Admin/EditCategory.vue'),
      meta: { auth: true }
    },
    {
      path: '/admin/edit/manufacturer/:id',
      name: 'EditManufacturer',
      component: () => import('@/pages/Admin/EditManufacturer.vue'),
      meta: { auth: true }
    }
  ]
})

// role 1 - user, 0 - admin
router.beforeEach(async (to, from, next) => {
  const requireAuth = to.matched.some((record) => record.meta.auth)
  if (!requireAuth) return next()
  else {
    const user = supabase.auth.user()
    let role = 1
    if (user) {
      const data = await getOneById<UserRead, { role: number }>(
        'users',
        user.id,
        'role'
      )
      if (data) role = data.role
    }
    if (role !== 0) {
      next('/')
    } else {
      next()
    }
  }
})

export default router
