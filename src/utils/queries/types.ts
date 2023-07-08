import type {
  CartCreate,
  CartRead,
  CartUpdate
} from '@/types/tables/cart.types'
import type {
  CategoryRead,
  CategoryCreate,
  CategoryUpdate
} from '@/types/tables/categories.types'
import type {
  CategorySpecificationRead,
  CategorySpecificationCreate,
  CategorySpecificationUpdate
} from '@/types/tables/categorySpecifications.types'
import type {
  ManufacturerRead,
  ManufacturerCreate,
  ManufacturerUpdate
} from '@/types/tables/manufacturers.types'
import type {
  ProductRead,
  ProductCreate,
  ProductUpdate
} from '@/types/tables/products.types'
import type {
  ReviewCreate,
  ReviewRead,
  ReviewUpdate
} from '@/types/tables/reviews.types'
import type {
  SpecificationRead,
  SpecificationCreate,
  SpecificationUpdate
} from '@/types/tables/specifications.types'
import type {
  UserRead,
  UserCreate,
  UserUpdate
} from '@/types/tables/users.types'

export type UpdateData = {
  manufacturers: ManufacturerUpdate
  products: ProductUpdate
  categories: CategoryUpdate
  specifications: SpecificationUpdate
  category_specifications: CategorySpecificationUpdate
  users: UserUpdate
  cart: CartUpdate
  reviews: ReviewUpdate
}

export type CreateData = {
  manufacturers: ManufacturerCreate
  products: ProductCreate
  categories: CategoryCreate
  specifications: SpecificationCreate
  category_specifications: CategorySpecificationCreate
  users: UserCreate
  cart: CartCreate
  reviews: ReviewCreate
}

export type ResultData = {
  manufacturers: ManufacturerRead
  products: ProductRead
  categories: CategoryRead
  specifications: SpecificationRead
  category_specifications: CategorySpecificationRead
  users: UserRead
  cart: CartRead
  reviews: ReviewRead
}

export type Table =
  | 'categories'
  | 'category_specifications'
  | 'manufacturers'
  | 'products'
  | 'specifications'
  | 'users'
  | 'cart'
  | 'reviews'

export type GetAllParams = {
  eq?: [column: string, value: string | number | null][]
  in?: [column: string, values: (number | string)[]]
  select?: string
  order?: {
    value: string
    ascending?: boolean
  }
  search?: {
    column: string
    value?: string
  }
  between?: {
    column: string
    begin: number
    end: number
  }
  limit?: number
  neq?: [column: string, value: number | string]
}

export type getParams = {
  order?: string
  select?: string
}

export type ResultType<T extends Table, R> = R extends null ? ResultData[T] : R

export type UpdateMany<T> = T & Required<Pick<T, keyof T & 'id'>>
