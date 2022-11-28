import type { defaultValues } from '../types'

// C - create(insert) U - update
export interface IcategoriesCU {
  title: string
  enTitle: string
  img: string
}
export interface Icategories extends defaultValues, IcategoriesCU {}

export interface IcategoryFieldCU {
  categoryId: number
  title: string | number
  type: boolean
  visible: boolean
  units: string
}
export interface IcategoryField extends defaultValues, IcategoryFieldCU {}
