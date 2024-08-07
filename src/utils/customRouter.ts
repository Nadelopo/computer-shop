import {
  useRoute,
  useRouter,
  type RouteLocationNormalizedLoaded,
  type Router,
  type NavigationFailure,
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

//-----------------------------------------------------------------

type RouteModified<T extends RouteName> = {
  [K in keyof RouteParams<T>]: string
}

export type CustomRoute<T extends RouteName> = Omit<
  RouteLocationNormalizedLoaded,
  'params'
> & {
  params: RouteModified<T>
}

export const useCustomRoute = <T extends RouteName>(
  // eslint-disable-next-line
  _: T
): CustomRoute<T> => {
  return useRoute() as CustomRoute<T>
}
