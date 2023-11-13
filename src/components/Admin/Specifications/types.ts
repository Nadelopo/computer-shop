import type { CategorySpecificationCreate } from '@/types/tables/categorySpecifications.types'

export type CategorySpecificationForm = Omit<
  CategorySpecificationCreate,
  'categoryId'
> & {
  categoryId: number | null
}
