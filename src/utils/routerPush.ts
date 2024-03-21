import { useRouter, type RouteLocationRaw } from 'vue-router'
import type { RouteName, RouteParams } from '@/router/types'
import type { ParamsType } from '@/components/AppLink.vue'

type RouterToParams<T extends RouteName> = Exclude<RouteLocationRaw, string> & {
  name: T
} & ParamsType<T, RouteParams<T>>

export const routerPush = (to: RouteLocationRaw) => {
  const router = useRouter()
  return router.push(to)
}

export const useRouterPush = () => {
  const router = useRouter()
  const routerPush = <T extends RouteName>(to: RouterToParams<T>) => {
    return router.push(to)
  }
  return { routerPush }
}
