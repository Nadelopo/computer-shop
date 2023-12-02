import type { ProductRead } from '@/types/tables/products.types'

export type ProductCardData = Pick<
  ProductRead,
  | 'id'
  | 'name'
  | 'price'
  | 'priceWithoutDiscount'
  | 'discount'
  | 'img'
  | 'rating'
> & {
  categories: {
    id: number
    enTitle: string
  }
}
