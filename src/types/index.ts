import type { IproductR, IproductSpecificationR } from './tables'

//product
export interface IproductWithSpecifications extends IproductR {
  specifications: Omit<IproductSpecificationR, 'created_at'>[]
}
