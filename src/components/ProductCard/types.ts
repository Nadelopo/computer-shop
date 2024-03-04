import type { ProductRead } from '@/types/tables/products.types'

export type ProductCardData = Pick<
  ProductRead,
  | 'id'
  | 'title'
  | 'price'
  | 'priceWithoutDiscount'
  | 'discount'
  | 'img'
  | 'rating'
  | 'quantity'
> & {
  categories: {
    id: number
    enTitle: string
  }
}
