import type { ProductWithSpecifications } from '@/types/tables/products.types'
import type { SpecificationRead } from '@/types/tables/specifications.types'

export type CategorySpecifications = {
  title: string
  categoryId: number
  units: string
}

export type Category = {
  id: number
  title: string
  count: number
  specifications: CategorySpecifications[]
}

export type CurrentCategory = {
  id: number | null
  specifications: CategorySpecifications[]
}

export type ComparisonProduct = Omit<
  ProductWithSpecifications,
  'specifications'
> & {
  specifications: SpecificationRead[]
}
