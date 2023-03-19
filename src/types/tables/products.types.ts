export interface ProductRead {
  categoryId: number
  countReviews: number
  created_at: string
  description: string
  discount: number
  id: number
  img: string
  manufacturerId: number
  name: string
  popularity: number
  price: number
  quantity: number
  rating: number
  sell: boolean
  warranty: number
}

export interface ProductInsert {
  categoryId: number
  countReviews?: number
  created_at?: string
  description: string
  discount?: number
  id?: number
  img: string
  manufacturerId: number
  name: string
  popularity?: number
  price: number
  quantity: number
  rating?: number
  sell?: boolean
  warranty: number
}

export interface ProductUpdate {
  categoryId?: number
  countReviews?: number
  created_at?: string
  description?: string
  discount?: number
  id?: number
  img?: string
  manufacturerId?: number
  name?: string
  popularity?: number
  price?: number
  quantity?: number
  rating?: number
  sell?: boolean
  warranty?: number
}
