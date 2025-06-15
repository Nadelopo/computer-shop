import type { SpecificationReadWithDetails } from '@/modules/specifications/model/specifications.types'
import type { DbEnum } from '@/shared/api/database.types'
import type { SpecificationCreate } from '@/modules/specifications'
import type { RouteToProduct } from './getRouteToProduct'

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
  rating?: number
  sell?: boolean
  warranty: number
}

export type ProductRead = Required<ProductCreate>

export type ProductUpdate = Partial<ProductCreate>

export type ProductWithSpecifications = ProductReadWithDetails & {
  specifications: SpecificationReadWithDetails[]
}

export type ProductCardData = Pick<
  ProductRead,
  'id' | 'title' | 'price' | 'priceWithoutDiscount' | 'discount' | 'img' | 'rating'
> & {
  categories: {
    id: number
    enTitle: string
  }
  quantity: number
}

export type SpecificationCreateForm = Omit<
  SpecificationCreate,
  'productId' | 'valueString' | 'valueNumber'
> & {
  title: string
  productId: number | undefined
} & (
    | {
        type: 'number'
        valueNumber: number
        valueString: null
        max: number
        min: number
        step: number
      }
    | {
        type: Exclude<DbEnum<'category_specification_type'>, 'number'>
        valueNumber: null
        valueString: string[]
        variantsValues: string[]
        max: null
        min: null
        step: null
      }
  )

export type SpecificationUpdateForm = SpecificationCreateForm & { id: number }

export type ProductSuggestion = RouteToProduct & { title: string }
