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
  push: <T extends RouteName>(
    to: RouterTo<T>
  ) => Promise<void | NavigationFailure | undefined>
}

export const useCustomRouter = (): CustomRouter => {
  return useRouter()
}
