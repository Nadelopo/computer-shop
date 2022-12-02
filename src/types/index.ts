import type { IproductR, IproductSpecificationR } from './tables'

//productWithSpecifications
export interface IproductWithSpecifications extends IproductR {
  specifications: Omit<IproductSpecificationR, 'created_at'>[]
}

export interface IproductSpecificationOnEdit {
  id: number
  categorySpecificationsId: {
    id: number
    title: string
    type: boolean
    visible: boolean
    units: string
    step: number | null
    min: number | null
    max: number | null
    variantsValues: string[] | null
  }
  productId: number
  value: string
}

export interface IproductWithSpecificationsOnEdit extends IproductR {
  specifications: IproductSpecificationOnEdit[]
}

export interface ImanufacturerSelect {
  id: number
  title: string
}
