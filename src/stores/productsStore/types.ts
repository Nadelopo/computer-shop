import type { defaultValues } from '../types'

// C - create(insert) U - update
export interface IspetificationsCU {
  productId: number
  value: string
  categorySpecificationsId: number
}

export interface Ispetification extends defaultValues, IspetificationsCU {}

export interface IproductC {
  categoryId: number
  name: string
  description: string
  manufacturerId: {
    id: number
    title: string
  }
  img: string
  warranty: number
  quantity: number
  price: number
  rating: number
  countReviews: number
  popularity: number
  discount: number
}

export interface Iproduct extends defaultValues, IproductC {}

export interface IproductSpecification {
  id: number
  categorySpecificationsId: {
    id: number
    title: string
    units: string
    visible?: boolean
    type?: boolean
    step?: number
    min?: number
    max?: number
  }
  value: string
  productId: number
}

export interface IproductSpecificationU
  extends Omit<
    IproductSpecification,
    'categorySpecificationsId' | 'productId'
  > {}

export interface IproductWithSpecifications extends defaultValues, IproductC {
  specifications: IproductSpecification[]
}

export interface IproductU
  extends Omit<
    IproductC,
    | 'categoryId'
    | 'quantity'
    | 'rating'
    | 'countReviews'
    | 'popularity'
    | 'manufacturerId'
  > {
  manufacturerId: number
}
