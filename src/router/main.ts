import { userRoutes } from '@/modules/users'
import { manufacturersRoutes } from '@/modules/manufacturers'
import Home from '@/pages/Home.vue'
import type { AppRouteRecord } from './index'
import { productRoutes } from '@/modules/products/router'

export const mainRoutes = [
  {
    path: '',
    name: 'Home',
    component: Home
  },

  {
    path: '/cart',
    name: 'Cart',
    component: () => import('@/pages/Cart.vue')
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('@/pages/Checkout.vue')
  },
  ...productRoutes,
  ...manufacturersRoutes,
  ...userRoutes
] as const satisfies readonly AppRouteRecord[]
