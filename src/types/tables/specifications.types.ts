export type SpecificationRead = {
  categorySpecificationsId: {
    id: number
    title: string
    visible: boolean
    units: string
  }
  created_at: string
  id: number
  productId: number
  valueString: string | null
  valueNumber: number | null
}

export type SpecificationCreate = {
  categorySpecificationsId: number
  created_at?: string
  id?: number
  productId: number
  valueString: string | null
  valueNumber: number | null
}

export type SpecificationUpdate = Partial<SpecificationCreate>
