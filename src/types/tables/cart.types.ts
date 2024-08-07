export type CartCreate = {
  id?: number
  created_at?: string
  userId: string
  productId: number
  count: number
  additionalWarranty: number
  isPriceChanged: boolean
}

export type CartRead = Required<CartCreate>

export type CartUpdate = Partial<CartCreate>
