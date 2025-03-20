import type { AppRouteRecord } from './index'

export const profileRoutes = [
  {
    path: '/profile',
    component: () => import('@/app/layouts/profile/ProfileLayout.vue'),
    meta: { auth: true },
    children: [
      {
        path: '',
        name: 'ProfileMain',
        component: () => import('@/pages/Profile/ProfileMainPage.vue')
      },
      {
        path: 'reviews',
        name: 'ProfileReviews',
        component: () => import('@/pages/Profile/ProfileReviewsPage.vue')
      },
      {
        path: 'orders',
        name: 'ProfileOrders',
        component: () => import('@/pages/Profile/ProfileOrdersPage.vue')
      },
      {
        path: 'delivery',
        name: 'ProfileDelivery',
        component: () => import('@/pages/Profile/ProfileDeliveryPage.vue')
      },
      {
        path: 'settings',
        name: 'ProfileSettings',
        component: () => import('@/pages/Profile/ProfileSettingsPage.vue')
      }
    ]
  }
] as const satisfies readonly AppRouteRecord[]
