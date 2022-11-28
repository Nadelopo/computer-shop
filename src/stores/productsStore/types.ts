import type { defaultValues } from '../types'

// C - create(insert) U - update
export interface IspetificationsCU {
  productId: number
  value: string
  categoryFieldId: number
}

export interface Ispetification extends defaultValues, IspetificationsCU {}

export interface IproductCU {
  categoryId: number
  name: string
  description: string
  manufacturer: string
  img: string
  warranty: number
  quantity: number
  price: number
  rating: number
  countReviews: number
  popularity: number
  discount: number
}

export interface Iproduct extends defaultValues, IproductCU {}

export interface IproductSpecification {
  categoryFieldId: {
    title: string
    units: string
    visible: boolean
  }
  value: string
  productId: number
}

export interface IproductWithSpecifications extends defaultValues, IproductCU {
  fields: IproductSpecification[]
}
