import type { ProductRead } from '@/types/tables/products.types'

export type ProductCardData = ProductRead & {
  categories: {
    id: number
    enTitle: string
  }
}
