import { supabase } from '@/supabase'

//fix
export const getAll = async <T>(
  table: string,
  order?: string,
  select?: string
) => {
  let query = supabase.from(table).select()
  if (order) {
    query = query.order(order)
  }
  if (select) {
    query = query.select(select)
  }
  const resp = await query
  if (resp.error) console.log(resp.error)
  const data = resp.data as T[] | null
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
  selectValue?: string,
  order?: string,
  seach?: string
) => {
  const select = selectValue ?? '*'
  let query = supabase.from(table).select(select).eq(column, id)
  if (order) {
    query = query.order(order)
  }
  if (seach) {
    {
      query = query.textSearch('name', seach, {
        config: 'russian',
        type: 'websearch',
      })
    }
  }
  const resp = await query
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
