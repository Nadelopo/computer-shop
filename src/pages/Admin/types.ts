import type { InjectionKey, Ref } from 'vue'
import type { ProductWithSpecifications } from '@/types/tables/products.types'
import type { Loading } from '@/types'

// provide in Admin.vue
export const productsKey: InjectionKey<Ref<ProductWithSpecifications[]>> =
  Symbol('products')

export const setProductsKey: InjectionKey<() => Promise<void>> =
  Symbol('setProducts')

export const loadingKey: InjectionKey<Ref<Loading>> = Symbol('loading')
