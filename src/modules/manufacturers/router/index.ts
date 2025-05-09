import type { AppRouteRecord } from '@/router'

export const manufacturersAdminRoutes = [
  {
    path: 'manufacturers',
    name: 'AdminManufacturers',
    component: () => import('../pages/ManufacturersManagementPage.vue')
  },
  {
    path: 'manufacturers/edit/:id',
    name: 'EditManufacturer',
    component: () => import('../pages/ManufacturerEditPage.vue')
  }
] as const satisfies AppRouteRecord[]

export const manufacturersRoutes = [
  {
    path: '/manufacturer/:title/:id',
    name: 'Manufacturer',
    component: () => import('../pages/ManufacturerPage.vue')
  }
] as const satisfies AppRouteRecord[]
