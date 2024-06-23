import type { DbEnum } from '@/db/database.types'
import type { CategoryRead } from './categories.types'
import type { OrderedProductRead } from './orderedProducts.types'
import type { ProductRead } from './products.types'

export type OrderRead = {
  id: number
  created_at: string
  price: number
  status: DbEnum<'order_status'>
  paymentStatus: DbEnum<'order_payment_status'>
  phone: number
  name: string
  email: string
  floor: number | null
  entrance: number | null
} & (
  | OrderDetails<string, 'selfcall'>
  | OrderDetails<string, 'delivery'>
  | OrderDetails<null, 'selfcall'>
  | OrderDetails<null, 'delivery'>
)

type OrderDetails<
  U extends string | null,
  T extends 'selfcall' | 'delivery' = 'selfcall'
> = {
  userId: U
  type: T
  shopAddress: T extends 'selfcall' ? string : null
  deliveryDate: T extends 'delivery' ? string : null
  address: T extends 'delivery' ? string : null
  apartment: T extends 'delivery' ? number : null
  city: T extends 'delivery' ? string : null
}

export type OrderCreate = {
  id?: number
  created_at?: string
  price: number
  status: DbEnum<'order_status'>
  paymentStatus: DbEnum<'order_payment_status'>
  userId: string | null
  type: DbEnum<'order_type'>
  shopAddress: string | null
  deliveryDate: string | null
  address: string | null
  apartment: number | null
  floor: number | null
  entrance: number | null
  city: string | null
  phone: number
  name: string
  email: string
}

export type OrderUpdate = Partial<OrderCreate>

export type OrderReadWithDetails = OrderRead & {
  ordered_products: (OrderedProductRead & {
    products: Pick<ProductRead, 'id' | 'img' | 'title'> & {
      categories: Pick<CategoryRead, 'id' | 'enTitle'>
    }
  })[]
}
