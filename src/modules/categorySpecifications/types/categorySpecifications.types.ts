import type { DbEnum } from '@/shared/api/database.types'

export type CategorySpecificationCreate = {
  categoryId: number
  created_at?: string
  id?: number
  title: string
  enTitle: string
  units: string
  visible?: boolean
} & (
  | {
      type: 'number'
      max: number
      min: number
      step: number
      condition: DbEnum<'category_specification_condition'>
      variantsValues: null
    }
  | {
      type: Exclude<DbEnum<'category_specification_type'>, 'number'>
      max: null
      min: null
      step: null
      condition: null
      variantsValues: string[]
    }
)

export type CategorySpecificationRead = Required<CategorySpecificationCreate>

export type CategorySpecificationUpdate = Partial<{
  [K in keyof CategorySpecificationCreate]: CategorySpecificationCreate[K]
}>

export type CategorySpecificationForm = Omit<
  CategorySpecificationCreate,
  'categoryId'
> & {
  categoryId: number | null
}
