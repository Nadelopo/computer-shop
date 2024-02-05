export type ShopRead = Required<ShopCreate>

export type ShopCreate = {
  id?: number
  created_at?: string
  address: string
  phone: number
  timeStart: string
  timeEnd: string
}

export type ShopUpdate = Partial<ShopCreate>
