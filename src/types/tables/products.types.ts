export interface ProductsRow {
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

export interface ProductsInsert {
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

export interface ProductsUpdate {
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
