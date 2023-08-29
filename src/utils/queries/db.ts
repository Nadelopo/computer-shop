import { supabase } from '@/supabase'
import { formatSearch } from '../formatSearch'
import type { GetAllParams, GetAllResult, Id, UpdateMany } from './types'
import type { CreateData, Table, UpdateData } from '@/types/database.types'

export type ForeignWithoutNull<T> = T extends Array<any>
  ? {
      [K in keyof T[0]]: K extends Table ? NonNullable<T[0][K]> : T[0][K]
    }[]
  : {
      [K in keyof T]: K extends Table ? NonNullable<T[K]> : T[K]
    }

export async function getOneById<T extends Table, S extends string = '*'>(
  table: T,
  id: Id<T>,
  select?: S
): Promise<ForeignWithoutNull<typeof data>> {
  const { data, error } = await supabase
    .from(table)
    .select(select)
    .eq('id', id)
    .single()
  if (error) console.error(error)
  return data as ForeignWithoutNull<typeof data>
}

export const getAll = async <
  R extends object = never,
  T extends Table = Table,
  S extends string = [R] extends [never] ? '*' : string
>(
  table: T,
  params?: GetAllParams<S>
): Promise<GetAllResult<typeof data, R>> => {
  const { order, search, between, limit, match, neq, range, select } =
    params || {}
  const orderColumn = order?.[0] ?? 'id'

  const query = supabase
    .from(table)
    .select(select, {
      count: 'exact'
    })
    .order(orderColumn, {
      ascending: order?.[1] ?? true
    })

  if (match) {
    query.match(match)
  }
  if (params?.in) {
    query.in(params.in[0], params.in[1])
  }
  if (search) {
    query.ilike(search[0], formatSearch(search[1]))
  }
  if (between) {
    query.gte(between.column, between.begin)
    query.lte(between.column, between.end)
  }
  if (limit) {
    query.limit(limit)
  }
  if (neq) {
    query.neq(neq[0], neq[1])
  }
  if (range) {
    query.range(range[0], range[1])
  }

  const { data, error, count } = await query

  if (error) console.error(error)
  return { data, count } as GetAllResult<typeof data, R>
}

export const createOne = async <T extends Table, S extends string = '*'>(
  table: T,
  fields: CreateData<T>,
  select?: S
): Promise<ForeignWithoutNull<typeof data>> => {
  const { data, error } = await supabase
    .from(table)
    .insert(fields as any)
    .select(select)
    .single()

  if (error) console.error(error)
  return data as ForeignWithoutNull<typeof data>
}

export const createMany = async <T extends Table>(
  table: T,
  fields: CreateData<T>[]
): Promise<ForeignWithoutNull<typeof data>> => {
  const { data, error } = await supabase
    .from(table)
    .insert(fields as any)
    .select()
  if (error) console.error(error)
  return data as ForeignWithoutNull<typeof data>
}

export async function updateOneById<T extends Table, S extends string = '*'>(
  table: T,
  id: Id<T>,
  fields: UpdateData<T>,
  select?: S
): Promise<ForeignWithoutNull<typeof data>> {
  const { data, error } = await supabase
    .from(table)
    .update(fields as any)
    .eq('id', id)
    .select(select)
    .single()
  if (error) console.error(error)
  return data as ForeignWithoutNull<typeof data>
}

export async function updateManyById<T extends Table>(
  table: T,
  fields: UpdateMany<UpdateData<T>>[]
) {
  const promises = []
  for (const item of fields) {
    promises.push(
      supabase
        .from(table)
        .update(item as any)
        .eq('id', item.id as any)
        .select()
        .single()
    )
  }

  const results = await Promise.all(promises)

  const data = results
    .map((e) => {
      if (e.error) {
        console.error(e.error)
      }
      return e.data
    })
    .filter((e): e is NonNullable<typeof e> => e !== null)
  return data
}

export const deleteOneById = async <T extends Table>(
  table: T,
  id: Id<T>
): Promise<typeof data | null> => {
  const { data, error } = await supabase
    .from(table)
    .delete()
    .eq('id', id)
    .select()
    .single()

  if (error) console.error(error)
  return data
}
