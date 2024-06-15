import type { RouteName } from '@/router/types'
import type { Suggestion } from './Navbar.vue'

export const getRouteTo = (suggestion: Suggestion) => {
  let to: {
    name: RouteName
    params: Record<string, any>
  }
  if (suggestion.type === 'category') {
    to = {
      name: 'CategoryProducts',
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
