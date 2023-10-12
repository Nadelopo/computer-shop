import { supabase } from '@/supabase'
import { formatSearch } from '../formatSearch'
import type { GetAllParams, Id, UpdateMany } from './types'
import type { CreateData, Table, UpdateData } from '@/types/database.types'

type ForeignWithoutNull<T> = T extends Array<any>
  ? {
      [K in keyof T[0]]: K extends Table ? NonNullable<T[0][K]> : T[0][K]
    }[]
  : {
      [K in keyof T]: K extends Table ? NonNullable<T[K]> : T[K]
    }

type ReturnType<D> = {
  [K in keyof D]: K extends 'data' ? ForeignWithoutNull<D[K]> : D[K]
}

export async function getOneById<T extends Table, S extends string = '*'>(
  table: T,
  id: Id<T>,
  select?: S
): Promise<ReturnType<typeof response>> {
  const response = await supabase
    .from(table)
    .select(select)
    .eq('id', id)
    .single()
  if (response.error) console.error(response.error)
  return response as ReturnType<typeof response>
}

export const getAll = async <
  R extends object = never,
  T extends Table = Table,
  S extends string = [R] extends [never] ? '*' : string
>(
  table: T,
  params?: GetAllParams<S>
): Promise<ReturnType<typeof response>> => {
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

  const response = await query

  if (response.error) console.error(response.error)
  return response as ReturnType<typeof response>
}

export const createOne = async <T extends Table, S extends string = '*'>(
  table: T,
  fields: CreateData<T>,
  select?: S
): Promise<ReturnType<typeof response>> => {
  const response = await supabase
    .from(table)
    .insert(fields as any)
    .select(select)
    .single()

  if (response.error) console.error(response.error)
  return response as ReturnType<typeof response>
}

export const createMany = async <T extends Table>(
  table: T,
  fields: CreateData<T>[]
): Promise<ReturnType<typeof response>> => {
  const response = await supabase
    .from(table)
    .insert(fields as any)
    .select()
  if (response.error) console.error(response.error)
  return response as ReturnType<typeof response>
}

export async function updateOneById<T extends Table, S extends string = '*'>(
  table: T,
  id: Id<T>,
  fields: UpdateData<T>,
  select?: S
): Promise<ReturnType<typeof response>> {
  const response = await supabase
    .from(table)
    .update(fields as any)
    .eq('id', id)
    .select(select)
    .single()
  if (response.error) console.error(response.error)
  return response as ReturnType<typeof response>
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
    .map((r) => {
      if (r.error) {
        console.error(r.error)
      }
      return r.data
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)

  return data
}

export const deleteOneById = async <T extends Table>(
  table: T,
  id: Id<T>
): Promise<ReturnType<typeof response>> => {
  const response = await supabase
    .from(table)
    .delete()
    .eq('id', id)
    .select()
    .single()

  if (response.error) console.error(response.error)
  return response as ReturnType<typeof response>
}
