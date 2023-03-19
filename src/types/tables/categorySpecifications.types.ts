//categorySpecifications

export type CategorySpecificationsReact = {
  categoryId: number
  created_at: string
  id: number
  title: string
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

export type CategorySpecificationsInsert = {
  categoryId?: number
  created_at?: string
  id?: number
  title: string
  units: string
  visible?: boolean
} & (
  | {
      type: true
      max?: number
      min?: number
      step?: number
      variantsValues?: null
    }
  | {
      type: false
      max?: null
      min?: null
      step?: null
      variantsValues?: string[]
    }
)

export type CategorySpecificationsUpdate = {
  categoryId?: number
  created_at?: string
  id?: number
  title?: string
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
