import { supabase } from '@/supabase'
import type {
  CreateManyParams,
  CreateParams,
  Eq,
  GetAllByColumnsParams,
  TableType,
  UpdateManyParams,
  UpdateOneParams,
  getAllParams,
  resultType,
  resultUpdateType,
  updateType
} from './types'

type conditionResult<T, K> = K extends updateType ? K : T

export async function getAll<
  T extends resultType,
  K extends updateType | null = null
>(
  table: TableType<T>,
  params?: getAllParams<T>
): Promise<conditionResult<T, K>[] | null> {
  const order = params?.order ?? 'id'
  const { data, error } = await supabase
    .from(table)
    .select(params?.select)
    .order(order)
  if (error) console.log(error)
  return data as conditionResult<T, K>[] | null
}

export const getOneById = async <T>(
  table: TableType<T>,
  id: string | number,
  select?: string
): Promise<T | null> => {
  const { data, error } = await supabase
    .from(table)
    .select(select)
    .eq('id', id)
    .single()
  if (error) console.log(error)
  return data
}

export const getAllByColumns = async <T extends resultType>(
  table: TableType<T>,
  eq: Eq<T>[],
  params?: GetAllByColumnsParams<T>
): Promise<T[] | null> => {
  const search = params?.search
  let query = supabase
    .from(table)
    .select(params?.select)
    .order(params?.order ?? 'id')

  for (const value of eq) {
    if (value.value) {
      query = query.eq(value.column, value.value)
    }
  }
  if (search?.value) {
    {
      query = query.textSearch(search.column, search.value, {
        config: 'russian',
        type: 'websearch'
      })
    }
  }
  if (params?.between) {
    const between = params.between
    {
      query = query.gt(between.column, between.begin)
      query = query.lt(between.column, between.end)
    }
  }
  if (params?.limit) {
    {
      query = query.limit(params.limit)
    }
  }
  if (params?.neq) {
    {
      const neq = params.neq
      query = query.neq(neq.column, neq.value)
    }
  }
  const { data, error } = await query
  if (error) console.log(error)
  return data
}

export const createOne = async <T extends resultType>(
  table: TableType<T>,
  params: CreateParams<T>
): Promise<T | null> => {
  const { data, error } = await supabase.from(table).insert(params).single()
  if (error) console.log(error)
  return data
}

export const createMany = async <T extends resultType>(
  table: TableType<T>,
  params: CreateManyParams<T>
): Promise<T[] | null> => {
  const { data, error } = await supabase.from(table).insert(params)
  if (error) console.log(error)
  return data
}

export async function updateOne<T extends resultType>(
  table: TableType<T>,
  id: number | string,
  params: UpdateOneParams<T>
): Promise<T | null> {
  const { data, error } = await supabase
    .from(table)
    .update(params)
    .eq('id', id)
    .single()
  if (error) console.log(error)
  return data
}

export const updateMany = async <T extends resultUpdateType>(
  table: TableType<T>,
  params: UpdateManyParams<T>[]
): Promise<T[]> => {
  const data: T[] = []
  for (const item of params) {
    const { data: result, error } = await supabase
      .from(table)
      .update(item)
      .eq('id', item.id)
      .single()
    if (error) console.log(error)
    if (result) data.push(result)
  }

  return data
}

export const deleteOne = async <T extends resultType>(
  table: TableType<T>,
  id: number,
  eq?: Eq<T>[]
) => {
  let query = supabase
    .from<T>(table)
    .delete()
    .eq('id', id as T[keyof T])

  if (eq) {
    for (const value of eq) {
      if (value.value) {
        query = query.eq(value.column, value.value)
      }
    }
  }

  const { data, error } = await query.single()
  if (error) console.log(error)
  return data
}
