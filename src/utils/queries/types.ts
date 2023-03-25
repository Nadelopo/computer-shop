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
  SpecificationRead,
  SpecificationCreate,
  SpecificationUpdate
} from '@/types/tables/specifications.types'
import type {
  UserRead,
  UserCreate,
  UserUpdate
} from '@/types/tables/users.types'

export type Table =
  | 'categories'
  | 'category_specifications'
  | 'manufacturers'
  | 'products'
  | 'specifications'
  | 'users'

type GetParams<T> = {
  order?: keyof T
  select?: string
}

export type GetAllByColumnsEq<T> = {
  column: keyof T
  value: T[keyof T] | null
}

export type GetAllByColumnsParams<T> = {
  select?: string
  order?: string
  search?: {
    column: keyof T
    value?: string
  }
}

export type CreateParams<T> = T extends ProductRead
  ? ProductCreate
  : T extends CategoryRead
  ? CategoryCreate
  : T extends SpecificationRead
  ? SpecificationCreate
  : T extends ManufacturerRead
  ? ManufacturerCreate
  : T extends UserRead
  ? UserCreate
  : T extends CategorySpecificationRead
  ? CategorySpecificationCreate
  : {}

export type CreateManyParams<T> = T extends ProductRead
  ? ProductCreate[]
  : T extends CategoryRead
  ? CategoryCreate[]
  : T extends SpecificationRead
  ? SpecificationCreate[]
  : T extends ManufacturerRead
  ? ManufacturerCreate[]
  : T extends UserRead
  ? UserCreate[]
  : T extends CategorySpecificationRead
  ? CategorySpecificationCreate[]
  : {}

export type resultType =
  | ProductRead
  | CategoryRead
  | ManufacturerRead
  | UserRead
  | CategorySpecificationRead
  | SpecificationRead

export type UpdateOneParams<T> = T extends ProductRead
  ? ProductUpdate
  : T extends CategoryRead
  ? CategoryUpdate
  : T extends SpecificationRead
  ? SpecificationUpdate
  : T extends ManufacturerRead
  ? ManufacturerUpdate
  : T extends UserRead
  ? UserUpdate
  : T extends CategorySpecificationRead
  ? CategorySpecificationUpdate
  : {}

export type UpdateMany<T> = T & Required<Pick<T, keyof T & 'id'>>

export type UpdateManyParams<T> = T extends ProductRead
  ? UpdateMany<ProductUpdate>
  : T extends CategoryRead
  ? UpdateMany<CategoryUpdate>
  : T extends SpecificationRead
  ? UpdateMany<SpecificationUpdate>
  : T extends ManufacturerRead
  ? UpdateMany<ManufacturerUpdate>
  : T extends UserRead
  ? UpdateMany<UserUpdate>
  : T extends CategorySpecificationRead
  ? UpdateMany<CategorySpecificationUpdate>
  : {}

export type getAllParams<T> = T extends ProductRead
  ? GetParams<ProductRead>
  : T extends CategoryRead
  ? GetParams<CategoryRead>
  : T extends ManufacturerRead
  ? GetParams<ManufacturerRead>
  : T extends SpecificationRead
  ? GetParams<SpecificationRead>
  : T extends UserRead
  ? GetParams<UserRead>
  : T extends CategorySpecificationRead
  ? GetParams<CategorySpecificationRead>
  : T

export type TableType<T> = T extends ProductRead
  ? 'products'
  : T extends CategoryRead
  ? 'categories'
  : T extends SpecificationRead
  ? 'specifications'
  : T extends ManufacturerRead
  ? 'manufacturers'
  : T extends UserRead
  ? 'users'
  : T extends CategorySpecificationRead
  ? 'category_specifications'
  : Table

export type updateType =
  | ProductUpdate
  | UserUpdate
  | SpecificationUpdate
  | CategoryUpdate
  | CategorySpecificationUpdate
  | ManufacturerUpdate
