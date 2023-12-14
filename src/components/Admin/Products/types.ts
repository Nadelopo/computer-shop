import type { DbEnums } from '@/types/database.types'
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
      }
    | {
        type: Exclude<DbEnums<'category_specification_type'>, 'number'>
        valueNumber: null
        valueString: string[]
        variantsValues: string[]
      }
  )

export type SpecificationUpdateForm = SpecificationCreateForm & { id: number }
