import type { SpecificationReadWithDetails } from '@/types/tables/specifications.types'

export const getSpecificationValue = (
  specification: SpecificationReadWithDetails
): number | string => {
  if (specification.category_specifications.type === 'number') {
    return specification.valueNumber as number
  }
  if (specification.category_specifications.type === 'string') {
    return specification.valueString?.[0] as string
  }
  return specification.valueString?.join(', ') as string
}
