import type { AppRouteRecord } from '@/router/index'

export const userRoutes = [
  {
    path: '/favourites',
    name: 'Favourites',
    meta: { auth: true },
    component: () => import('@/modules/user/pages/FavoritesPage.vue')
  },
  {
    path: '/comparison',
    name: 'Comparison',
    component: () => import('@/modules/user/pages/ComparisonPage.vue')
  },
  {
    path: '/profile',
    component: () => import('@/app/layouts/profile/ProfileLayout.vue'),
    meta: { auth: true },
    children: [
      {
        path: '',
        name: 'ProfileMain',
        component: () => import('@/modules/user/pages/ProfileMainPage.vue')
      },
      {
        path: 'reviews',
        name: 'ProfileReviews',
        component: () => import('@/modules/user/pages/ProfileReviewsPage.vue')
      },
      {
        path: 'orders',
        name: 'ProfileOrders',
        component: () => import('@/modules/user/pages/ProfileOrdersPage.vue')
      },
      {
        path: 'delivery',
        name: 'ProfileDelivery',
        component: () => import('@/modules/user/pages/ProfileDeliveryPage.vue')
      },
      {
        path: 'settings',
        name: 'ProfileSettings',
        component: () => import('@/modules/user/pages/ProfileSettingsPage.vue')
      }
    ]
  }
] as const satisfies readonly AppRouteRecord[]
