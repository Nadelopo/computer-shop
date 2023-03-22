import type { SpecificationRead } from './specifications.types'

export type ProductRead = {
  categoryId: number
  countReviews: number
  created_at: string
  description: string
  discount: number
  id: number
  img: string
  manufacturerId: {
    id: number
    title: string
  }
  name: string
  popularity: number
  price: number
  quantity: number
  rating: number
  sell: boolean
  warranty: number
}

export type ProductCreate = {
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

export type ProductUpdate = Partial<ProductCreate>

export type ProductWithSpecifications = ProductRead & {
  specifications: SpecificationRead[]
}
