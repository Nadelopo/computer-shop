import type { Database, Table } from '@/types/database.types'

export type GetAllParams<S> = {
  match?: Record<string, unknown>
  in?: [column: string, values: (number | string)[]]
  select?: S
  order?: [column: string, ascending?: boolean]
  search?: [column: string, value?: string]
  between?: {
    column: string
    begin: number
    end: number
  }
  limit?: number
  neq?: [column: string, value: number | string]
  range?: [from: number, to: number]
  onlyCount?: boolean
}

export type UpdateMany<T> = T & Required<Pick<T, keyof T & 'id'>>

export type Id<T extends Table> = Database['public']['Tables'][T]['Row']['id']
