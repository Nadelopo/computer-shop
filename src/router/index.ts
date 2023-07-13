import { createRouter, createWebHistory } from 'vue-router'
import Auth from '@/pages/Auth.vue'
import Home from '@/pages/Home.vue'
import { supabase } from '@/supabase'
import { getOneById } from '@/utils/queries/db'
import { Role, type UserRead } from '@/types/tables/users.types'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/auth',
      name: 'Auth',
      component: Auth
    },
    {
      path: '/products/:category/:id',
      name: 'CategoryProducts',
      component: () => import('@/pages/CategoryProducts.vue')
    },
    {
      path: '/admin',
      name: 'AdminHome',
      component: () => import('@/pages/Admin/AdminHome.vue'),
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
    },
    {
      path: '/cart',
      name: 'Cart',
      component: () => import('@/pages/Cart.vue'),
      meta: { auth: true }
    },
    {
      path: '/products/:category/:categoryId/:productId',
      name: 'Product',
      component: () => import('@/pages/Product.vue')
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('@/pages/Profile/Profile.vue'),
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
    },
    {
      path: '/favourites',
      name: 'Favourites',
      meta: { auth: true },
      component: () => import('@/pages/Favourites.vue')
    },
    {
      path: '/comparison',
      name: 'Comparison',
      component: () => import('@/pages/Comparison.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/pages/NotFound.vue')
    }
  ]
})

router.beforeEach(async (to, from) => {
  const requireAuth = to.matched.some((record) => record.meta.auth)
  if (!requireAuth) return true
  const user = supabase.auth.user()
  if (!user) {
    if (!from.name) return { name: 'Home' }
    else return false
  }
  const data = await getOneById<{ role: UserRead['role'] }>('users', user.id, {
    select: 'role'
  })
  if (!data) return false
  const requireAdmin = to.matched.some((record) => record.meta.admin)
  if (requireAdmin && data.role !== Role.ADMIN) return { name: 'Home' }
  return true
})

export default router
