import { supabase } from '@/supabase'
import { formatSearch } from '../formatSearch'
import type { PostgrestSingleResponse } from '@supabase/supabase-js'
import type {
  CreateData,
  GetAllParams,
  ResultData,
  Table,
  UpdateData,
  UpdateMany,
  getParams,
  Result
} from './types'

export async function getOneById<
  Z extends object = never,
  T extends Table = Table
>(
  table: T,
  id: string | number,
  params?: getParams
): Promise<Result<T, Z> | null> {
  const { data, error } = await supabase
    .from(table)
    .select(params?.select)
    .eq('id', id)
    .order(params?.order ?? 'id')
    .single()
  if (error) console.log(error)
  return data
}

export const getAll = async <Z extends object = never, T extends Table = Table>(
  table: T,
  params?: GetAllParams
): Promise<Result<T, Z>[] | null> => {
  const search = params?.search
  const order = params?.order?.value ?? 'id'
  const query = supabase
    .from(table)
    .select(params?.select)
    .order(order, {
      ascending: params?.order?.ascending ?? true
    })

  const eq = params?.eq || []
  for (const value of eq) {
    if (value[1]) {
      query.eq(value[0], value[1])
    }
  }

  if (params?.in) {
    query.in(params.in[0], params.in[1])
  }

  if (search?.value) {
    query.ilike(search.column, formatSearch(search.value))
  }

  if (params?.between) {
    const between = params.between
    query.gt(between.column, between.begin)
    query.lt(between.column, between.end)
  }

  if (params?.limit) {
    query.limit(params.limit)
  }

  if (params?.neq) {
    const neq = params.neq
    query.neq(neq[0], neq[1])
  }

  const { data, error } = await query
  if (error) console.log(error)
  return data
}

export const createOne = async <
  Z extends object = never,
  T extends Table = Table
>(
  table: T,
  fields: CreateData[T],
  params?: {
    select?: string
  }
): Promise<Result<T, Z> | null> => {
  let query = supabase.from(table).insert(fields)
  if (params?.select) {
    query = query.select(params.select)
  }
  const { data, error } = await query.single()
  if (error) console.log(error)
  return data
}

export const createMany = async <T extends Table>(
  table: T,
  fields: CreateData[T][]
): Promise<ResultData[T][] | null> => {
  const { data, error } = await supabase.from(table).insert(fields)
  if (error) console.log(error)
  return data
}

export async function updateOne<
  Z extends object = never,
  T extends Table = Table
>(
  table: T,
  id: number | string,
  fields: UpdateData[T]
): Promise<Result<T, Z> | null> {
  const { data, error } = await supabase
    .from(table)
    .update(fields)
    .eq('id', id)
    .single()
  if (error) console.log(error)
  return data
}

export async function updateMany<
  Z extends object = never,
  T extends Table = Table
>(table: T, fields: UpdateMany<UpdateData[T]>[]): Promise<Result<T, Z>[]> {
  const promises = []
  for (const item of fields) {
    promises.push(supabase.from(table).update(item).eq('id', item.id).single())
  }

  const results: PostgrestSingleResponse<Result<T, Z>>[] = await Promise.all(
    promises
  )

  const data: Result<T, Z>[] = results
    .map((e) => e.data)
    .filter((e): e is never => e !== null)

  return data
}

export const deleteOne = async <
  Z extends object = never,
  T extends Table = Table
>(
  table: T,
  id: number
): Promise<Result<T, Z> | null> => {
  const { data, error } = await supabase
    .from(table)
    .delete()
    .eq('id', id)
    .single()

  if (error) console.log(error)
  return data
}
