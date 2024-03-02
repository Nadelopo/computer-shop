import type { SpecificationReadWithDetails } from './specifications.types'

export type ProductRead = Required<ProductCreate>

export type ProductReadWithDetails = {
  categories: {
    id: number
    enTitle: string
  }
  categoryId: number
  countReviews: number
  created_at: string
  description: string
  discount: number
  id: number
  img: string[]
  manufacturers: {
    id: number
    title: string
  }
  manufacturerId: number
  title: string
  popularity: number
  price: number
  priceWithoutDiscount: number
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
  img: string[]
  manufacturerId: number
  title: string
  popularity?: number
  price: number
  priceWithoutDiscount: number
  quantity: number
  rating?: number
  sell?: boolean
  warranty: number
}

export type ProductUpdate = Partial<ProductCreate>

export type ProductWithSpecifications = ProductReadWithDetails & {
  specifications: SpecificationReadWithDetails[]
}
