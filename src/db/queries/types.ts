import type { Database, Table } from '@/types/database.types'

type ReadData<T extends keyof Database['public']['Tables']> =
  | keyof Database['public']['Tables'][T]['Row']
  | (string & {})

export type QueryOrder<T extends Table> = [
  column: ReadData<T>,
  options?: { ascending?: boolean; foreignTable?: Table }
]

export type GetAllParams<S, T extends Table> = {
  match?: Partial<Record<ReadData<T>, unknown>>
  in?: Partial<Record<ReadData<T>, (number | string)[]>>
  select?: S
  order?: QueryOrder<T> | QueryOrder<T>[]
  search?: [column: ReadData<T>, value?: string]
  between?: {
    column: ReadData<T>
    begin: number
    end: number
  }[]
  limit?: number
  neq?: [column: ReadData<T>, value: number | string]
  range?: [from: number, to: number]
  onlyCount?: boolean
  gt?: [column: ReadData<T>, value: number]
  lt?: [column: ReadData<T>, value: number]
  gte?: [column: ReadData<T>, value: number]
  lte?: [column: ReadData<T>, value: number]
}

export type UpdateMany<T> = T & Required<Pick<T, keyof T & 'id'>>

export type Id<T extends Table> = Database['public']['Tables'][T]['Row']['id']
