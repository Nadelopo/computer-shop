import {
  useRouter,
  Router,
  NavigationFailure,
  type RouteLocationRaw
} from 'vue-router'
import type { RouteName, RouteParams } from '@/router/types'

export type RouterTo<T extends RouteName> = Exclude<
  RouteLocationRaw,
  string
> & {
  name?: T
  params?: RouteParams<T>
}

export type CustomRouter = Omit<Router, 'push'> & {
  customPush: <T extends RouteName>(
    to: RouterTo<T>
  ) => Promise<void | NavigationFailure | undefined>
}

export const useCustomRouter = (): CustomRouter => {
  const router = useRouter() as unknown as CustomRouter
  router.customPush = <T extends RouteName>(to: RouterTo<T>) => {
    return (router as unknown as Router).push(to)
  }

  return router
}
