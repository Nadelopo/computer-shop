export type ProductInStorage = {
  id?: number
  created_at?: string
  userId?: string
  productId: number
  count: number
}

export type Category = {
  id: number
  title: string
  count: number
}
