import type { defaultValues } from '../types'

export interface IcategoriesInsert {
  title: string
  enTitle: string
  img: string
}
export interface Icategories extends defaultValues, IcategoriesInsert {}

export interface IcategoryFieldsInsert {
  categoryId: number
  title: string | number
  type: boolean
  visible: boolean
  units: string
}
export interface IcategoryFields extends defaultValues, IcategoryFieldsInsert {}
