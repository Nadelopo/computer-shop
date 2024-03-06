import type { PostgrestError } from '@supabase/supabase-js'

export type Loading = 'loading' | 'success' | 'empty' | 'error'

export type DataError<T> =
  | { data: T; error: null }
  | { data: null; error: PostgrestError }
