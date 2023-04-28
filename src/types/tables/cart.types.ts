export type CartRead = Required<CartCreate>

export type CartCreate = {
  id?: number
  created_at?: string
  userId: string
  productId: number
  count: number
}

export type CartUpdate = Partial<CartCreate>
