import type { RouteName } from '@/app/router/types'
import type { CategoryRead } from '@/modules/categories'

export type RouteToProduct = {
  id: number
  type: 'category' | 'product'
  enTitle?: string
  categories?: Pick<CategoryRead, 'id' | 'enTitle'>
}

export const getRouteToProduct = (suggestion: RouteToProduct) => {
  let to: {
    name: RouteName
    params: Record<string, string | number | undefined>
  }
  if (suggestion.type === 'category') {
    to = {
      name: 'ProductCatalog',
      params: {
        id: suggestion.id,
        category: suggestion.enTitle
      }
    }
  } else {
    to = {
      name: 'Product',
      params: {
        categoryId: suggestion.categories?.id,
        category: suggestion.categories?.enTitle,
        productId: suggestion.id
      }
    }
  }
  return to
}
