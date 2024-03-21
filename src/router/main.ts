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
    path: '/manufacturer/:title/:id',
    name: 'Manufacturer',
    component: () => import('@/pages/Manufacturer.vue')
  }
] as const satisfies readonly AppRouteRecord[]
