import type { TypeOfRoutes, AppRouteRecord } from './index'

type GetRouteName<T extends AppRouteRecord> = T extends {
  children: readonly AppRouteRecord[]
}
  ? GetRoutesNames<T['children']>
  : T extends { name: string }
  ? T['name']
  : never
export type GetRoutesNames<T extends readonly AppRouteRecord[]> = GetRouteName<
  T[number]
>
export type RouteName = GetRoutesNames<TypeOfRoutes>

type GetRoutePath<T extends AppRouteRecord, N extends RouteName> = T extends {
  children: readonly AppRouteRecord[]
}
  ? T['path'] | GetRoutesPaths<T['children'], N>
  : N extends T['name']
  ? T['path']
  : never
export type GetRoutesPaths<
  T extends readonly AppRouteRecord[],
  N extends RouteName
> = GetRoutePath<T[number], N>

type RouteNameToPath<T extends RouteName> = GetRoutesPaths<TypeOfRoutes, T>

type ExtractParamsKeys<T extends string> =
  T extends `${string}:${infer Key}/${infer Rest}`
    ? Key | ExtractParamsKeys<Rest>
    : T extends `${string}:${infer Key}`
    ? Key
    : never

export type RouteParamsKeys<T extends RouteName> = ExtractParamsKeys<
  RouteNameToPath<T>
>

export type RouteParams<T extends RouteName> = {
  [K in RouteParamsKeys<T>]: string | number
}
