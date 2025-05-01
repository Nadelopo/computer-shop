import type { AppRouteRecord } from '@/router/index'

export const userRoutes = [
  {
    path: '/favourites',
    name: 'Favourites',
    meta: { auth: true },
    component: () => import('@/modules/users/pages/FavoritesPage.vue')
  },
  {
    path: '/comparison',
    name: 'Comparison',
    component: () => import('@/modules/users/pages/ComparisonPage.vue')
  },
  {
    path: '/profile',
    component: () => import('@/app/layouts/profile/ProfileLayout.vue'),
    meta: { auth: true },
    children: [
      {
        path: '',
        name: 'ProfileMain',
        component: () => import('@/modules/users/pages/ProfileMainPage.vue')
      },
      {
        path: 'reviews',
        name: 'ProfileReviews',
        component: () => import('@/modules/users/pages/ProfileReviewsPage.vue')
      },
      {
        path: 'orders',
        name: 'ProfileOrders',
        component: () => import('@/modules/users/pages/ProfileOrdersPage.vue')
      },
      {
        path: 'delivery',
        name: 'ProfileDelivery',
        component: () => import('@/modules/users/pages/ProfileDeliveryPage.vue')
      },
      {
        path: 'settings',
        name: 'ProfileSettings',
        component: () => import('@/modules/users/pages/ProfileSettingsPage.vue')
      }
    ]
  }
] as const satisfies readonly AppRouteRecord[]
