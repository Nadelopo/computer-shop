import type { DbEnums } from '../database.types'

export type CategorySpecificationRead = Required<CategorySpecificationCreate>

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
      condition: DbEnums<'category_specification_condition'>
      variantsValues: null
    }
  | {
      type: Exclude<DbEnums<'category_specification_type'>, 'number'>
      max: null
      min: null
      step: null
      condition: null
      variantsValues: string[]
    }
)

export type CategorySpecificationUpdate = Partial<CategorySpecificationCreate>
