import type { AppRouteRecord } from '@/router'

export const productRoutes = [
  {
    path: '/products/:category/:id',
    name: 'ProductCatalog',
    component: () => import('@/modules/products/pages/ProductCatalog.vue')
  },
  {
    path: '/products/:category/:categoryId/:productId',
    name: 'Product',
    component: () => import('@/modules/products/pages/Product.vue')
  }
] as const satisfies readonly AppRouteRecord[]

export const productAdminRoutes = [
  {
    path: 'products/:category/:id',
    name: 'AdminProducts',
    component: () => import('@/modules/products/pages/AdminProductsManagement.vue')
  },
  {
    path: 'products/edit/:category/:categoryId/:id',
    name: 'EditProducts',
    component: () => import('@/modules/products/pages/AdminProductEdit.vue')
  }
] as const satisfies readonly AppRouteRecord[]
