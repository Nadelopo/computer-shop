import { RouteRecordRaw, createRouter, createWebHistory } from 'vue-router'
import { useToast } from 'vue-toastification'
import { supabase } from '@/supabase'
import { getOneById } from '@/utils/queries/db'
import { adminRoutes } from './admin'
import { profileRoutes } from './profile'
import Auth from '@/pages/Auth.vue'
import Home from '@/pages/Home.vue'
import { Role, type UserRead } from '@/types/tables/users.types'

export const routes: RouteRecordRaw[] = [
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
    component: () => import('@/pages/Cart.vue')
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
    component: () => import('@/pages/Favourites/Favourites.vue')
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

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
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
  const requireAdmin = to.matched.some((record) => record.meta.admin)
  if (!requireAdmin) return true
  const data = await getOneById<{ role: UserRead['role'] }>('users', user.id, {
    select: 'role'
  })
  if (!data) return false
  if (data.role !== Role.ADMIN) return { name: 'Home' }
  return true
})

export default router
