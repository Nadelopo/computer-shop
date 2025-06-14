import Home from '@/pages/Home/Home.vue'
import type { AppRouteRecord } from './index'
import { profileRoutes } from './profile'

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
  {
    path: '/manufacturer/:title/:id',
    name: 'Manufacturer',
    component: () => import('@/pages/Manufacturer/Manufacturer.vue')
  },
  {
    path: '/products/:category/:id',
    name: 'ProductCatalog',
    component: () => import('@/pages/ProductCatalog/ProductCatalog.vue')
  },
  {
    path: '/products/:category/:categoryId/:productId',
    name: 'Product',
    component: () => import('@/pages/Product/Product.vue')
  },
  {
    path: '/favourites',
    name: 'Favourites',
    meta: { auth: true },
    component: () => import('@/pages/FavoritesPage.vue')
  },
  {
    path: '/comparison',
    name: 'Comparison',
    component: () => import('@/pages/ComparisonPage/ComparisonPage.vue')
  },
  ...profileRoutes
] as const satisfies readonly AppRouteRecord[]
