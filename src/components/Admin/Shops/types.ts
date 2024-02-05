import type { ShopCreate } from '@/types/tables/shops.types'

export type ShopForm = Pick<ShopCreate, 'address'> & {
  time: string
  phone: string
}
