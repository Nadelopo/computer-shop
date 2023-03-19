export interface SpecificationRead {
  categorySpecificationsId: number
  created_at: string
  id: number
  productId: number
  value: string
}

export interface SpecificationInsert {
  categorySpecificationsId: number
  created_at?: string
  id?: number
  productId: number
  value: string
}

export interface SpecificationUpdate {
  categorySpecificationsId?: number
  created_at?: string
  id?: number
  productId?: number
  value?: string
}
