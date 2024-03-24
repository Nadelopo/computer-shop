import type { AppRouteRecord } from './index'

export const adminRoutes = [
  {
    path: '/admin',
    component: () => import('@/layouts/Admin.vue'),
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
        component: () => import('@/pages/Admin/CategoriesManagement.vue')
      },
      {
        path: 'categories/edit/:category/:id',
        name: 'EditCategory',
        component: () => import('@/pages/Admin/EditCategory.vue')
      },
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
      {
        path: 'manufacturers',
        name: 'AdminManufacturers',
        component: () => import('@/pages/Admin/ManufacturersManagement.vue')
      },
      {
        path: 'manufacturers/edit/:id',
        name: 'EditManufacturer',
        component: () => import('@/pages/Admin/EditManufacturer.vue')
      },
      {
        path: 'specifications',
        name: 'AdminSpecifications',
        component: () => import('@/pages/Admin/SpecificationsManagement.vue')
      },
      {
        path: 'specifications/edit/:categoryId/:id',
        name: 'EditSpecification',
        component: () => import('@/pages/Admin/EditSpecification.vue')
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
      }
    ]
  }
] as const satisfies readonly AppRouteRecord[]
