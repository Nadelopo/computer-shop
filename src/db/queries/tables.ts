import { supabase } from '@/db/supabase'
import { formatSearch } from '../../utils/formatSearch'
import type { GetAllParams, Id, UpdateMany } from './types'
import type { CreateData, Table, UpdateData } from '@/types/database.types'

type ForeignWithoutNull<T> = T extends Array<infer U>
  ? { [K in keyof U]: K extends Table ? NonNullable<U[K]> : U[K] }[]
  : { [K in keyof T]: K extends Table ? NonNullable<T[K]> : T[K] }

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

export const getAll = async <T extends Table = Table, S extends string = '*'>(
  table: T,
  params?: GetAllParams<S, T>
): Promise<ReturnType<typeof response>> => {
  const {
    order,
    search,
    between,
    limit,
    match,
    neq,
    range,
    select,
    gt,
    gte,
    lt,
    lte
  } = params || {}

  const query = supabase.from(table).select(select, {
    count: 'estimated',
    head: params?.onlyCount
  })

  if (!params?.onlyCount) {
    const [orderColumn, ascending] = order ?? ['id', true]
    query.order(orderColumn as string, { ascending })
  }
  if (match) {
    query.match(match)
  }
  if (params?.in) {
    query.in(params.in[0] as string, params.in[1])
  }
  if (search) {
    query.ilike(search[0] as string, formatSearch(search[1]))
  }
  if (between) {
    query.gte(between.column as string, between.begin)
    query.lte(between.column as string, between.end)
  }
  if (limit) {
    query.limit(limit)
  }
  if (neq) {
    query.neq(neq[0] as string, neq[1])
  }
  if (range) {
    query.range(range[0], range[1])
  }
  if (gt) {
    query.gt(gt[0] as string, gt[1])
  }
  if (gte) {
    query.gte(gte[0] as string, gte[1])
  }
  if (lt) {
    query.lt(lt[0] as string, lt[1])
  }
  if (lte) {
    query.lte(lte[0] as string, lte[1])
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
