import type { AppRouteRecord } from './index'

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
      {
        path: 'categories',
        name: 'AdminCategories',
        component: () => import('@/pages/Admin/CategoryManagement/CategoryManagement.vue')
      },
      {
        path: 'categories/edit/:category/:id',
        name: 'CategoryEdit',
        component: () => import('@/pages/Admin/CategoryEdit.vue')
      },
      {
        path: 'manufacturers',
        name: 'AdminManufacturers',
        component: () =>
          import('@/pages/Admin/ManufacturersManagement/ManufacturersManagement.vue')
      },
      {
        path: 'manufacturers/edit/:id',
        name: 'EditManufacturer',
        component: () => import('@/pages/Admin/ManufacturerEdit.vue')
      },
      {
        path: 'products/:category/:id',
        name: 'AdminProducts',
        component: () => import('@/pages/Admin/ProductsManagement/ProductsManagement.vue')
      },
      {
        path: 'products/edit/:category/:categoryId/:id',
        name: 'EditProducts',
        component: () => import('@/pages/Admin/ProductEdit.vue')
      },
      {
        path: 'specifications',
        name: 'AdminSpecifications',
        component: () =>
          import('@/pages/Admin/SpecificationsManagement/SpecificationsManagement.vue')
      },
      {
        path: 'specifications/edit/:categoryId/:id',
        name: 'SpecificationEdit',
        component: () => import('@/pages/Admin/SpecificationEdit.vue')
      },
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
