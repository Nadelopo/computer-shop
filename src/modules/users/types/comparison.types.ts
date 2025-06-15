import type { CategorySpecificationRead } from '@/modules/categorySpecifications'
import type { ProductWithSpecifications } from '@/modules/products'
import type { SpecificationRead } from '@/modules/specifications'

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
