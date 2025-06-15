import { type RouteRecordRaw, createRouter, createWebHistory } from 'vue-router'
import { useToast } from 'vue-toastification'
import { supabase } from '@/shared/api'
import { useUserStore, Role } from '@/modules/users'
import { adminRoutes } from './admin'
import { mainRoutes } from './main'
import MainLayout from '@/app/layouts/main/MainLayout.vue'
import AuthPage from '@/pages/AuthPage.vue'

export type AppRouteRecord = Omit<RouteRecordRaw, 'name' | 'children'> & {
  name?: string
  children?: readonly AppRouteRecord[]
}
// TODO сделать более правильный нейминг для роутов
export const routes = [
  ...adminRoutes,
  {
    path: '/',
    component: MainLayout,
    children: mainRoutes
  },
  {
    path: '/auth',
    name: 'Auth',
    component: AuthPage
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
  const isAuth = await userStore.getSessionUser()

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
