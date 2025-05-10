import type { AppRouteRecord } from '@/router'

export const specificationsRoutes = [
  {
    path: 'specifications',
    name: 'AdminSpecifications',
    component: () => import('../pages/AdminSpecificationsManagement.vue')
  },
  {
    path: 'specifications/edit/:categoryId/:id',
    name: 'SpecificationEdit',
    component: () => import('../pages/AdminSpecificationEdit.vue')
  }
] as const satisfies AppRouteRecord[]
