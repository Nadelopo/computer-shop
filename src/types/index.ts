import type { PostgrestError } from '@supabase/supabase-js'

export type Loading = 'loading' | 'success' | 'empty' | 'error'
//prettier-ignore
// export type DataError<T extends {data: unknown, error: unknown}> = {

//   [K in keyof T]: K extends 'data' ? T['data'] : K extends 'error' ? null : T[K]
// } | {
//   [K in keyof T]: K extends 'data' ? null : K extends 'error' ? PostgrestError: T[K]
// }

export type DataError<T > = {

  data: T
  error: null
} | {
  data: null
  error: PostgrestError
}
