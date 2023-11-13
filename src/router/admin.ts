import type { RouteRecordRaw } from 'vue-router'

export const adminRoutes: RouteRecordRaw[] = [
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/layouts/Admin.vue'),
    meta: { auth: true, admin: true },
    children: [
      {
        path: 'categories',
        name: 'AdminCategories',
        component: () => import('@/pages/Admin/CategoriesManagement.vue')
      },
      {
        path: 'products/:category/:id',
        name: 'AdminProducts',
        component: () => import('@/pages/Admin/ProductsManagement.vue')
      },
      {
        path: 'manufacturers',
        name: 'AdminManufacturers',
        component: () => import('@/pages/Admin/ManufacturersManagement.vue')
      },
      {
        path: 'Specifications',
        name: 'AdminSpecifications',
        component: () => import('@/pages/Admin/SpecificationsManagement.vue')
      }
    ]
  },
  {
    path: '/admin/edit/:category/:categoryId/:id',
    name: 'EditProducts',
    component: () => import('@/pages/Admin/EditProducts.vue'),
    meta: { auth: true, admin: true }
  },
  {
    path: '/admin/edit/:category/:id',
    name: 'EditCategory',
    component: () => import('@/pages/Admin/EditCategory.vue'),
    meta: { auth: true, admin: true }
  },
  {
    path: '/admin/edit/manufacturer/:id',
    name: 'EditManufacturer',
    component: () => import('@/pages/Admin/EditManufacturer.vue'),
    meta: { auth: true, admin: true }
  },
  {
    path: '/admin/edit/specification/:categoryId/:id',
    name: 'EditSpecification',
    component: () => import('@/pages/Admin/EditSpecification.vue'),
    meta: { auth: true, admin: true }
  }
]
