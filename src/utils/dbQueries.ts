import { supabase } from '@/supabase'
import type { defaultValues } from '@/stores/types'
//fix
export const getAll = async <T>(table: string) => {
  const { data, error } = await supabase.from<T>(table).select()
  if (error) console.log(error)
  return { data }
}

export const getOneWithId = async <T>(table: string, id: string | number) => {
  const resp = await supabase.from(table).select().eq('id', id).single()
  if (resp.error) console.log(resp.error)
  const data: T | null = resp.data
  return { data }
}

export const getAllFromColumn = async <T>(
  table: string,
  column: string,
  id: string | number | boolean
) => {
  const resp = await supabase.from(table).select().eq(column, id)
  if (resp.error) console.log(resp.error)
  const data: T[] | null = resp.data
  return { data }
}

export const create = async <T>(table: string, params: T) => {
  const resp = await supabase.from<T>(table).insert(params).single()
  if (resp.error) console.log(resp.error)
  const data = resp.data as (T & defaultValues) | null
  return { data }
}

export const createMany = async <T>(table: string, params: T) => {
  const resp = await supabase.from<T>(table).insert(params)
  if (resp.error) console.log(resp.error)
  const data = resp.data as (T & defaultValues) | null
  return { data }
}
