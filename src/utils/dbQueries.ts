import { supabase } from '@/supabase'

//fix
export const getAll = async <T>(table: string) => {
  const { data, error } = await supabase.from<T>(table).select()
  if (error) console.log(error)
  return { data }
}

export const getOneWithId = async <T>(
  table: string,
  id: string | number,
  selectValue?: string
) => {
  const select = selectValue ?? '*'
  const resp = await supabase.from(table).select(select).eq('id', id).single()
  if (resp.error) console.log(resp.error)
  const data: T | null = resp.data
  return { data }
}

export const getAllByColumn = async <T>(
  table: string,
  column: string,
  id: string | number,
  selectValue?: string
) => {
  const select = selectValue ?? '*'
  const resp = await supabase.from(table).select(select).eq(column, id)
  if (resp.error) console.log(resp.error)
  const data: T[] | null = resp.data
  return { data }
}

export const create = async <T, R>(table: string, params: T) => {
  const resp = await supabase.from<T>(table).insert(params).single()
  if (resp.error) console.log(resp.error)
  const data = resp.data as R | null
  return { data }
}

export const createMany = async <T, R>(table: string, params: T) => {
  const resp = await supabase.from<T>(table).insert(params)
  if (resp.error) console.log(resp.error)
  const data = resp.data as R | null
  return { data }
}

export const updateOne = async <T extends Partial<T>, R>(
  table: string,
  id: number,
  params: T
) => {
  const resp = await supabase.from(table).update(params).eq('id', id).single()
  if (resp.error) console.log(resp.error)
  const data: R | null = resp.data

  return { data }
}

export const updateManyById = async <T, R>(table: string, params: T) => {
  const resp = await supabase.from<T>(table).upsert(params)
  if (resp.error) console.log(resp.error)
  const data = resp.data as R | null

  return { data }
}
