import type { DbEnum } from '@/types/database.types'
import type { SpecificationCreate } from '@/types/tables/specifications.types'

export type SpecificationCreateForm = Omit<
  SpecificationCreate,
  'productId' | 'valueString' | 'valueNumber'
> & {
  title: string
  productId: number | undefined
} & (
    | {
        type: 'number'
        valueNumber: number
        valueString: null
        max: number
        min: number
        step: number
      }
    | {
        type: Exclude<DbEnum<'category_specification_type'>, 'number'>
        valueNumber: null
        valueString: string[]
        variantsValues: string[]
        max: null
        min: null
        step: null
      }
  )

export type SpecificationUpdateForm = SpecificationCreateForm & { id: number }
