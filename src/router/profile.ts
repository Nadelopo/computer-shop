import type { RouteRecordRaw } from 'vue-router'

export const profileRoutes: RouteRecordRaw[] = [
  {
    path: '/profile',
    component: () => import('@/layouts/Profile.vue'),
    meta: { auth: true },
    children: [
      {
        path: '',
        name: 'ProfileMain',
        component: () => import('@/pages/Profile/Main.vue')
      },
      {
        path: 'reviews',
        name: 'ProfileReviews',
        component: () => import('@/pages/Profile/Reviews.vue')
      },
      {
        path: 'orders',
        name: 'ProfileOrders',
        component: () => import('@/pages/Profile/Orders.vue')
      },
      {
        path: 'delivery',
        name: 'ProfileDelivery',
        component: () => import('@/pages/Profile/Delivery.vue')
      }
    ]
  }
]
