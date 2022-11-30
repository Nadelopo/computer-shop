import type { IspetificationsCU } from './productsStore/types'

export interface defaultValues {
  readonly id: number
  readonly created_at: Date
}

export interface ImanufacturerSelect {
  id: number
  title: string
}

export interface IformCategorySpecifications
  extends Omit<IspetificationsCU, 'productId'> {
  productId: number | null
}
