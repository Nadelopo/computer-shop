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
        component: () => import('@/pages/Profile/MainPage.vue')
      },
      {
        path: 'reviews',
        name: 'ProfileReviews',
        component: () => import('@/pages/Profile/ReviewsPage.vue')
      },
      {
        path: 'orders',
        name: 'ProfileOrders',
        component: () => import('@/pages/Profile/OrdersPage.vue')
      },
      {
        path: 'delivery',
        name: 'ProfileDelivery',
        component: () => import('@/pages/Profile/DeliveryPage.vue')
      },
      {
        path: 'settings',
        name: 'ProfileSettings',
        component: () => import('@/pages/Profile/SettingsPage.vue')
      }
    ]
  }
] as const satisfies readonly AppRouteRecord[]
