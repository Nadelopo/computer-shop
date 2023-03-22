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
  value: string
}

export type SpecificationCreate = {
  categorySpecificationsId: number
  created_at?: string
  id?: number
  productId: number
  value: string
}

export type SpecificationUpdate = Partial<SpecificationCreate>
