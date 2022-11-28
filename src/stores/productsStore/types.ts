import type { defaultValues } from '../types'

export interface IspetificationsForm {
  productId: number
  value: string
  categoryFieldId: number
}

export interface Ispetifications extends defaultValues, IspetificationsForm {}

export interface IproductForm {
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
}

export interface Iproduct extends defaultValues, IproductForm {}

export interface IspecificationsProductCard {
  categoryFieldId: {
    title: string
    units: string
    visible: boolean
  }
  value: string
  productId: number
}

export interface IproductCard extends defaultValues, IproductForm {
  fields: IspecificationsProductCard[]
}
