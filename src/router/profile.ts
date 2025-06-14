import type { AppRouteRecord } from '.'

export const profileRoutes = [
  {
    path: '/profile',
    component: () => import('@/app/layouts/profile/ProfileLayout.vue'),
    meta: { auth: true },
    children: [
      {
        path: '',
        name: 'ProfileMain',
        component: () => import('@/pages/profile/MainPage.vue')
      },
      {
        path: 'reviews',
        name: 'ProfileReviews',
        component: () => import('@/pages/profile/ReviewsPage.vue')
      },
      {
        path: 'orders',
        name: 'ProfileOrders',
        component: () => import('@/pages/profile/OrdersPage.vue')
      },
      {
        path: 'delivery',
        name: 'ProfileDelivery',
        component: () => import('@/pages/profile/DeliveryPage.vue')
      },
      {
        path: 'settings',
        name: 'ProfileSettings',
        component: () => import('@/pages/profile/SettingsPage.vue')
      }
    ]
  }
] as const satisfies readonly AppRouteRecord[]
