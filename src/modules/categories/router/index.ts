import type { AppRouteRecord } from '@/router'

export const categoriesRoutes = [
  {
    path: 'categories',
    name: 'AdminCategories',
    component: () =>
      import('@/modules/categories/pages/AdminCategoryManagement.vue')
  },
  {
    path: 'categories/edit/:category/:id',
    name: 'CategoryEdit',
    component: () => import('@/modules/categories/pages/AdminCategoryEdit.vue')
  }
] as const satisfies readonly AppRouteRecord[]
