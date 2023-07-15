import { createRouter, createWebHistory } from 'vue-router'
import Auth from '@/pages/Auth.vue'
import Home from '@/pages/Home.vue'
import { supabase } from '@/supabase'
import { getOneById } from '@/utils/queries/db'
import { Role, type UserRead } from '@/types/tables/users.types'
import { adminRoutes } from './admin'
import { profileRoutes } from './profile'
import { useToast } from 'vue-toastification'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...adminRoutes,
    ...profileRoutes,
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
      path: '/cart',
      name: 'Cart',
      component: () => import('@/pages/Cart.vue'),
      meta: { auth: true }
    },
    {
      path: '/products/:category/:categoryId/:productId',
      name: 'Product',
      component: () => import('@/pages/Product.vue')
    },
    {
      path: '/favourites',
      name: 'Favourites',
      meta: { auth: true },
      component: () => import('@/pages/Favourites.vue')
    },
    {
      path: '/comparison',
      name: 'Comparison',
      component: () => import('@/pages/Comparison.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/pages/NotFound.vue')
    }
  ]
})

router.beforeEach(async (to, from) => {
  const requireAuth = to.matched.some((record) => record.meta.auth)
  if (!requireAuth) return true
  const user = supabase.auth.user()
  if (!user) {
    useToast().warning('Необходима авторизация')
    if (!from.name) return { name: 'Home' }
    else return false
  }
  const data = await getOneById<{ role: UserRead['role'] }>('users', user.id, {
    select: 'role'
  })
  if (!data) return false
  const requireAdmin = to.matched.some((record) => record.meta.admin)
  if (requireAdmin && data.role !== Role.ADMIN) return { name: 'Home' }
  return true
})

export default router
