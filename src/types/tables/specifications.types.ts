import type { DbEnum } from '../database.types'

export type SpecificationRead = Required<SpecificationCreate>

export type SpecificationReadWithDetails = {
  categorySpecificationsId: number
  category_specifications: {
    id: number
    title: string
    visible: boolean
    units: string
    type: DbEnum<'category_specification_type'>
  }
  created_at: string
  id: number
  productId: number
  valueString: string[] | null
  valueNumber: number | null
}

export type SpecificationCreate = {
  categorySpecificationsId: number
  created_at?: string
  id?: number
  productId: number
  valueString: string[] | null
  valueNumber: number | null
}

export type SpecificationUpdate = Partial<SpecificationCreate>
