export type CategorySpecificationRead = {
  categoryId: number
  created_at: string
  id: number
  title: string
  enTitle: string
  units: string
  visible: boolean
} & (
  | {
      type: true
      max: number
      min: number
      step: number
      variantsValues: null
    }
  | {
      type: false
      max: null
      min: null
      step: null
      variantsValues: string[]
    }
)

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
      variantsValues: null
    }
  | {
      type: false
      max: null
      min: null
      step: null
      variantsValues: string[]
    }
)

export type CategorySpecificationUpdate = {
  categoryId?: number
  created_at?: string
  id?: number
  title?: string
  enTitle?: string
  units?: string
  visible?: boolean
} & (
  | {
      type?: true
      max?: number
      min?: number
      step?: number
      variantsValues?: null
    }
  | {
      type?: false
      max?: null
      min?: null
      step?: null
      variantsValues?: string[]
    }
)
