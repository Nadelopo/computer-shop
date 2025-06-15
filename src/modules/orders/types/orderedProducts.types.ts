export type OrderedProductCreate = {
  id?: number
  created_at?: string
  productId: number
  count: number
  price: number
  additionalWarranty: number
  servicePrice: number
  orderId: number
}

export type OrderedProductRead = Required<OrderedProductCreate>

export type OrderedProductUpdate = Partial<OrderedProductCreate>
