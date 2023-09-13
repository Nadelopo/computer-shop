import type { RouteRecordRaw } from 'vue-router'

export const adminRoutes: RouteRecordRaw[] = [
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/Layouts/Admin.vue'),
    meta: { auth: true, admin: true },
    children: [
      {
        path: 'categories',
        name: 'AdminCategories',
        component: () => import('@/pages/Admin/AdminCategories.vue')
      },
      {
        path: 'products/:category/:id',
        name: 'AdminProducts',
        component: () => import('@/pages/Admin//AdminProducts.vue')
      },
      {
        path: 'manufacturers',
        name: 'AdminManufacturers',
        component: () => import('@/pages/Admin//AdminManufacturers.vue')
      },
      {
        path: 'Specifications',
        name: 'AdminSpecifications',
        component: () => import('@/pages/Admin//AdminSpecifications.vue')
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
    path: '/admin/edit/category/:id',
    name: 'EditCategory',
    component: () => import('@/pages/Admin/EditCategory.vue'),
    meta: { auth: true, admin: true }
  },
  {
    path: '/admin/edit/manufacturer/:id',
    name: 'EditManufacturer',
    component: () => import('@/pages/Admin/EditManufacturer.vue'),
    meta: { auth: true, admin: true }
  }
]
