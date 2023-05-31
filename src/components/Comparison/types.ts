import type { ProductWithSpecifications } from '@/types/tables/products.types'
import type { SpecificationRead } from '@/types/tables/specifications.types'

export type CategorySpecifications = {
  title: string
  categoryId: number
}

export type Category = {
  id: number
  title: string
  count: number
  specifications: CategorySpecifications[]
}

export type CurrentCategory = {
  id: number | undefined
  specifications: CategorySpecifications[]
}

export type ComparisonProduct = Omit<
  ProductWithSpecifications,
  'manufacturerId' | 'specifications'
> & {
  manufacturerId: number
  specifications: SpecificationRead[]
}
