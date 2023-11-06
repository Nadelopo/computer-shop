import type { CategorySpecificationRead } from '@/types/tables/categorySpecifications.types'
import type { ProductWithSpecifications } from '@/types/tables/products.types'
import type { SpecificationRead } from '@/types/tables/specifications.types'

export type CategorySpecifications = {
  title: string
  condition: CategorySpecificationRead['condition']
  categories: {
    id: number
    enTitle: string
  }
  units: string
  id: number
}

export type Category = {
  id: number
  title: string
  count: number
  specifications: CategorySpecifications[]
}

export type ComparisonProduct = Omit<
  ProductWithSpecifications,
  'specifications' | 'categories'
> & {
  categories: {
    id: number
    title: string
  }
  specifications: SpecificationRead[]
}

export type BasicProductData = {
  title: string
  value: (string | number)[]
  units: string
}
