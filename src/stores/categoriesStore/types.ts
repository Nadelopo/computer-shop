import type { defaultValues } from '../types'

// C - create(insert) U - update
export interface IcategoryCU {
  title: string
  enTitle: string
  img: string
}
export interface Icategory extends defaultValues, IcategoryCU {}

export interface IcategorySpecificationsCU {
  categoryId: number
  title: string | number
  type: boolean
  visible: boolean
  units: string
  step: number | null
  min: number
  max: number | null
  variantsValues: string[] | null
}
export interface IcategorySpecifications
  extends defaultValues,
    IcategorySpecificationsCU {}
