export type ProductQuantityInStoreRead = Required<ProductQuantityInStoreCreate>

export type ProductQuantityInStoreCreate = {
  id?: number
  created_at?: string
  productId: number
  quantity: number
  shopId: number
}

export type ProductQuantityInStoreUpdate = Partial<ProductQuantityInStoreCreate>
