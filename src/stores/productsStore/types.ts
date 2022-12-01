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
  manufacturerId: number
  img: string
  warranty: number
  quantity: number
  price: number
  rating: number
  countReviews: number
  popularity: number
  discount: number
}

export interface Iproduct
  extends defaultValues,
    Omit<IproductC, 'manufacturerId'> {
  manufacturerId: {
    id: number
    title: string
  }
}

export interface IproductSpecification {
  id: number
  categorySpecificationsId: {
    id: number
    title: string
    units: string
    visible?: boolean
    type?: boolean
    step?: number | null
    min?: number
    max?: number | null
  }
  value: string
  productId: number
}

export interface IproductSpecificationU
  extends Omit<
    IproductSpecification,
    'categorySpecificationsId' | 'productId'
  > {}

export interface IproductSpecificationR
  extends Omit<IproductSpecification, 'categorySpecificationsId'> {
  categorySpecificationsId: number
  created_at: Date
}

export interface IproductWithSpecifications
  extends defaultValues,
    Omit<IproductC, 'manufacturerId'> {
  specifications: IproductSpecification[]
  manufacturerId: {
    id: number
    title: string
  }
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
