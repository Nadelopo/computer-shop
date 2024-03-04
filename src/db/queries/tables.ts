import { supabase } from '@/db/supabase'
import { formatSearch } from '../../utils/formatSearch'
import type { GetAllParams, Id, QueryOrder, UpdateMany } from './types'
import type { CreateData, Table, UpdateData } from '@/types/database.types'

type IsKeyInValues<K extends PropertyKey> = K extends Table ? true : false

type ForeignWithoutNull<T> = {
  [K in keyof T]: IsKeyInValues<K> extends true
    ? NonNullable<T[K]> extends infer U
      ? U extends object
        ? ForeignWithoutNull<U>
        : U
      : never
    : T[K] extends object
    ? ForeignWithoutNull<T[K]>
    : T[K]
}

type ReturnType<D> = {
  [K in keyof D]: K extends 'data' ? ForeignWithoutNull<D[K]> : D[K]
}

const orderValuesIsArray = <T extends Table>(
  order: QueryOrder<T> | QueryOrder<T>[] | undefined
): order is QueryOrder<T>[] => {
  if (Array.isArray(order?.[0])) {
    return true
  }
  return false
}

export async function getOneById<T extends Table, S extends string = '*'>(
  table: T,
  id: Id<T>,
  select?: S,
  options?: {
    order: QueryOrder<T>
  }
): Promise<ReturnType<typeof response>> {
  const query = supabase.from(table).select(select).eq('id', id)

  if (options?.order) {
    const orderColumn = (options.order[0] ?? 'id') as string
    query.order(orderColumn, options.order[1])
  }
  const response = await query.single()
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
    if (orderValuesIsArray(order)) {
      for (const o of order) {
        query.order(o[0] as string, o[1])
      }
    } else {
      const [orderColumn] = order ?? ['id']
      query.order(orderColumn as string, order?.[1])
    }
  }
  if (match) {
    query.match(match)
  }
  if (params?.in) {
    for (const key in params.in) {
      const value = params.in[key]
      query.in(key, value as [])
    }
  }
  if (search) {
    query.ilike(search[0] as string, formatSearch(search[1]))
  }
  if (between) {
    for (const value of between) {
      query.gte(value.column as string, value.begin)
      query.lte(value.column as string, value.end)
    }
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
