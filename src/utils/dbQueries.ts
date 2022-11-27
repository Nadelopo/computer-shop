import { supabase } from '@/supabase'

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

export const getAllFromField = async <T>(
  table: string,
  field: string,
  id: string | number | boolean
) => {
  const resp = await supabase.from(table).select().eq(field, id)
  if (resp.error) console.log(resp.error)
  const data: T[] | null = resp.data
  return { data }
}

export const create = async <T, K>(table: string, params: T) => {
  const resp = await supabase.from<T>(table).insert(params).single()
  if (resp.error) console.log(resp.error)
  const data = resp.data as K | null
  return { data }
}
