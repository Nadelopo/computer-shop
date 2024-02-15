export type OrderedProduct = {
  productId: number
  count: number
  price: number
}

import type { DbEnum } from '../database.types'

export type OrderRead = {
  id: number
  created_at: string
  price: number
  status: DbEnum<'order_status'>
  orderedProducts: OrderedProduct[]
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
  deliveryDate: T extends 'delivery' ? Date : null
  address: T extends 'delivery' ? string : null
  apartment: T extends 'delivery' ? number : null
  floor: number | null
  entrance: number | null
  city: T extends 'delivery' ? string : null
  phone: U extends string ? null : number
  name: U extends string ? null : string
  email: U extends string ? null : string
}

export type OrderCreate = {
  id?: number
  created_at?: string
  price: number
  status: DbEnum<'order_status'>
  orderedProducts: OrderedProduct[]
  userId: string | null
  type: DbEnum<'order_type'>
  shopAddress: string | null
  deliveryDate: Date | null
  address: string | null
  apartment: number | null
  floor: number | null
  entrance: number | null
  city: string | null
  phone: null | number
  name: null | string
  email: null | string
}

export type OrderUpdate = Partial<OrderCreate>
