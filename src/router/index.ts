import { type RouteRecordRaw, createRouter, createWebHistory } from 'vue-router'
import { useToast } from 'vue-toastification'
import { supabase } from '@/db/supabase'
import { useUserStore } from '@/stores/userStore'
import { adminRoutes } from './admin'
import { mainRoutes } from './main'
import MainVue from '@/layouts/Main.vue'
import Auth from '@/pages/Auth.vue'
import { Role } from '@/types/tables/users.types'

export type AppRouteRecord = Omit<RouteRecordRaw, 'name' | 'children'> & {
  name?: string
  children?: readonly AppRouteRecord[]
}

export const routes = [
  ...adminRoutes,
  {
    path: '/',
    component: MainVue,
    children: mainRoutes
  },
  {
    path: '/auth',
    name: 'Auth',
    component: Auth
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/pages/NotFound.vue')
  }
] as const satisfies readonly AppRouteRecord[]

export type TypeOfRoutes = typeof routes

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes as unknown as RouteRecordRaw[]
})

router.beforeEach(async (to, from) => {
  const requireAuth = to.matched.some((record) => record.meta.auth)
  if (!requireAuth) return true

  const userStore = useUserStore()
  const isAuth = await userStore.isUserAuthenticated()

  if (!isAuth) {
    useToast().warning('Требуется авторизация')
    if (!from.name) return { name: 'Home' }
    return false
  }

  const requireAdmin = to.matched.some((record) => record.meta.admin)
  if (!requireAdmin) return true

  let role: number | undefined

  if (userStore.user) {
    role = userStore.user.role
  } else {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', isAuth.id)
      .single()
    if (error) return { name: 'Home' }

    role = data.role
  }

  if (role !== Role.ADMIN) return { name: 'Home' }
  return true
})

export default router
