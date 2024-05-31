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

export type CustomRouter = Omit<Router, 'push' | 'replace'> & {
  push: <T extends RouteName>(
    to: RouterTo<T>
  ) => Promise<void | NavigationFailure | undefined>
  replace: <T extends RouteName>(
    to: RouterTo<T>
  ) => Promise<NavigationFailure | void | undefined>
}

export const useCustomRouter = (): CustomRouter => {
  return useRouter()
}
