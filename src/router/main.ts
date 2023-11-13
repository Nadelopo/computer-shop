import { profileRoutes } from './profile'
import Home from '@/pages/Home.vue'
import type { RouteRecordRaw } from 'vue-router'

export const mainRoutes: RouteRecordRaw[] = [
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
  ...profileRoutes
]
