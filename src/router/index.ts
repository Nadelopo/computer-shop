import { RouteRecordRaw, createRouter, createWebHistory } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useUserStore } from '@/stores/userStore'
import { getOneById } from '@/db/queries/tables'
import { adminRoutes } from './admin'
import { mainRoutes } from './main'
import MainVue from '@/layouts/Main.vue'
import Auth from '@/pages/Auth.vue'
import { Role } from '@/types/tables/users.types'

export const routes: RouteRecordRaw[] = [
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
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(async (to, from) => {
  const requireAuth = to.matched.some((record) => record.meta.auth)
  if (!requireAuth) return true
  const { isUserAuthenticated } = useUserStore()
  const user = await isUserAuthenticated()
  if (!user) {
    useToast().warning('Требуется авторизация')
    if (!from.name) return { name: 'Home' }
    else return false
  }
  const requireAdmin = to.matched.some((record) => record.meta.admin)
  if (!requireAdmin) return true
  const { data, error } = await getOneById('users', user.id, 'role')
  if (error) return false
  if (data.role !== Role.ADMIN) return { name: 'Home' }
  return true
})

export default router
