import type { ProductRead } from '@/modules/products'

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

type QueryProduct = Omit<
  ProductRead,
  | 'countReviews'
  | 'created_at'
  | 'description'
  | 'manufacturerId'
  | 'popularity'
  | 'sell'
  | 'rating'
>

export type ProductCart = QueryProduct & {
  count: number
  cartItemId?: number
  additionalWarranty: number
  servicePrice: number
  isPriceChanged: boolean
  quantity: number
  categories: {
    enTitle: string
  }
}

export type ProductStorage = {
  id?: number
  created_at?: string
  userId?: string
  productId: number
  count: number
  isPriceChanged: boolean
  additionalWarranty: number
}
