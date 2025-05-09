import { userRoutes } from '@/modules/users'
import { manufacturersRoutes } from '@/modules/manufacturers'
import Home from '@/pages/Home.vue'
import type { AppRouteRecord } from './index'

export const mainRoutes = [
  {
    path: '',
    name: 'Home',
    component: Home
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
    path: '/checkout',
    name: 'Checkout',
    component: () => import('@/pages/Checkout.vue')
  },
  {
    path: '/products/:category/:categoryId/:productId',
    name: 'Product',
    component: () => import('@/pages/Product.vue')
  },
  ...manufacturersRoutes,
  ...userRoutes
] as const satisfies readonly AppRouteRecord[]
