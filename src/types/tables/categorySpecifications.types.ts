export type CategorySpecificationRead = Required<CategorySpecificationCreate>

export type CategorySpecificationCreate = {
  categoryId?: number
  created_at?: string
  id?: number
  title: string
  enTitle: string
  units: string
  visible?: boolean
} & (
  | {
      type: true
      max: number
      min: number
      step: number
      condition: 'greater' | 'less'
      variantsValues: null
    }
  | {
      type: false
      max: null
      min: null
      step: null
      condition: null
      variantsValues: string[]
    }
)

export type CategorySpecificationUpdate = Partial<CategorySpecificationCreate>
