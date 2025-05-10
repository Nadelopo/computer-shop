import { categoriesRoutes } from '@/modules/categories'
import type { AppRouteRecord } from './index'
import { manufacturersAdminRoutes } from '@/modules/manufacturers'
import { specificationsRoutes } from '@/modules/specifications'

export const adminRoutes = [
  {
    path: '/admin',
    component: () => import('@/app/layouts/admin/AdminLayout.vue'),
    meta: { auth: true, admin: true },
    children: [
      {
        path: '',
        name: 'AdminMain',
        component: () => import('@/pages/Admin/Main.vue')
      },
      ...categoriesRoutes,
      {
        path: 'products/:category/:id',
        name: 'AdminProducts',
        component: () => import('@/pages/Admin/ProductsManagement.vue')
      },
      {
        path: 'products/edit/:category/:categoryId/:id',
        name: 'EditProducts',
        component: () => import('@/pages/Admin/EditProduct.vue')
      },
      ...manufacturersAdminRoutes,
      ...specificationsRoutes,
      {
        path: 'shops',
        name: 'AdminShops',
        component: () => import('@/pages/Admin/ShopManagement.vue')
      },
      {
        path: 'shops/edit/:id',
        name: 'EditShop',
        component: () => import('@/pages/Admin/EditShop.vue')
      },
      {
        path: 'shop/:id',
        name: 'AdminShopDetails',
        component: () => import('@/pages/Admin/ShopDetails.vue')
      },
      {
        path: 'orders',
        name: 'AdminOrders',
        component: () => import('@/pages/Admin/Orders.vue')
      },

      {
        path: 'order/:id',
        name: 'AdminOrderDetails',
        component: () => import('@/pages/Admin/OrderDetails.vue')
      }
    ]
  }
] as const satisfies readonly AppRouteRecord[]
