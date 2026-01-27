import type { CategorySpecificationRead } from '@/modules/categorySpecifications'
import type { ProductWithSpecifications } from '@/modules/products'
import { supabase } from '@/shared/api'
import type { CustomRouter } from '@/shared/composables/customRouter'
import type { Loading } from '@/shared/types'
import { getOrFilterForSearch } from '@/shared/utils/getOrFilterForSearch'
import { inject, provide, reactive, ref, type InjectionKey, type Ref } from 'vue'
import { useRoute, useRouter, type RouteLocationNormalizedLoaded } from 'vue-router'
import {
  useFilterFieldNumber,
  useFilterFieldString
} from '../components/useFeatureStaticFilter'

type ProductCatalogContext = {
  products: Ref<ProductWithSpecifications[]>
  loading: Ref<Loading>
  setQueryParams: () => void
  setFilteredProducts: (categoryId: number) => Promise<void>
  search: Ref<string>
  sortAscents: SortConfig
  specificationsValues: Ref<SpecificationsValues[]>
  sortColumn: Ref<SortType>
  productsPrice: ReturnType<typeof useFilterFieldNumber>
  productCount: Ref<number>
  currentPage: Ref<number>
  limit: Ref<number>
  manufacturer: ReturnType<typeof useFilterFieldString>
  warranty: ReturnType<typeof useFilterFieldNumber>
  manufacturersVariants: Ref<{ id: number; title: string }[]>
  clearFilters: () => void
}

const PRODUCT_CATALOG_CONTEXT_KEY: InjectionKey<ProductCatalogContext> =
  Symbol('productCatalog')

type SpecificationsValues = Pick<
  CategorySpecificationRead,
  'id' | 'enTitle' | 'title' | 'visible'
> &
  (
    | {
        min: number
        max: number
        step: number
        minValue: number
        maxValue: number
        type: 'number'
      }
    | {
        variantsValues: string[]
        values: string[]
        type: 'string' | 'union'
      }
  )

export type CheckboxData = {
  id: number
  title: string
}

type SortConfig = {
  price: boolean
  countReviews: boolean
  discount: boolean
  popularity: boolean
  rating: boolean
}

export type SortType = keyof SortConfig

export const createProductCatalogContext = () => {
  const specificationsValues = ref<SpecificationsValues[]>([])

  const sortAscents: SortConfig = reactive({
    price: true,
    countReviews: true,
    discount: true,
    popularity: false,
    rating: true
  })

  const sortColumn = ref<SortType>('popularity')
  const search = ref('')
  const productsPrice = useFilterFieldNumber({
    max: 300_000
  })
  const manufacturer = useFilterFieldString()
  const warranty = useFilterFieldNumber({
    max: 72,
    visibility: false
  })
  const manufacturersVariants = ref<{ id: number; title: string }[]>([])

  const products = ref<ProductWithSpecifications[]>([])
  const productCount = ref(0)
  const limit = ref(5)
  const currentPage = ref(0)
  const loading = ref<Loading>('loading')

  const route = useRoute()
  const router = useRouter()

  function setQueryParams() {
    const query: {
      q: string | undefined
      page: number | undefined
      [key: string]: undefined | number | string | string[]
    } = { page: currentPage.value || undefined, q: search.value || undefined }
    for (const value of specificationsValues.value) {
      if (value.type === 'number') {
        const isNotDefaultValues = value.minValue !== 0 || value.maxValue !== value.max
        query[value.enTitle] = isNotDefaultValues
          ? `${value.minValue}_${value.maxValue}`
          : undefined
      } else {
        query[value.enTitle] = value.values
      }
    }
    router.push({
      query: {
        ...route.query,
        ...query,
        price: productsPrice.getQueryRow(),
        manufacturer: manufacturer.values.value,
        warranty: warranty.getQueryRow()
      }
    })

    currentPage.value = 0
  }

  async function setFilteredProducts(categoryId: number): Promise<void> {
    loading.value = 'loading'
    products.value = []

    let or = ''

    const usedSpecifications: number[] = []
    for (const specification of specificationsValues.value) {
      if (specification.type === 'number') {
        if (
          specification.minValue !== specification.min ||
          specification.maxValue !== specification.max
        ) {
          or += `and(categorySpecificationsId.eq.${specification.id},valueNumber.gte.${specification.minValue},valueNumber.lte.${specification.maxValue}),`
          usedSpecifications.push(specification.id)
        }
      } else if (specification.values.length) {
        let v = ''
        for (const value of specification.values) {
          v += `valueString.cs.{${value}},`
        }
        or += `and(categorySpecificationsId.eq.${
          specification.id
        },or(${v.slice(0, -1)})),`
        usedSpecifications.push(specification.id)
      }
    }
    or = or.slice(0, -1)

    const query = supabase
      .from('specifications')
      .select('categorySpecificationsId,products(id)')
      .match({ 'products.categoryId': categoryId })
    if (or) {
      query.or(or)
    }

    const { data, error } = await query
    if (error) {
      loading.value = 'error'
      return
    }

    let idList = data.map((e) => e.products?.id).filter((e): e is number => Boolean(e))
    idList = idList.filter((e) => {
      const count = idList.filter((v) => v === e).length
      return count >= usedSpecifications.length
    })

    if (!idList.length) {
      loading.value = 'empty'
      productCount.value = 0
      return
    }

    const countMap = new Map()
    idList.forEach((item) => {
      countMap.set(item, (countMap.get(item) || 0) + 1)
    })
    const maxCount = Math.max(...countMap.values())
    const numbersWithMaxRepetitions = Array.from(countMap.entries())
      .filter(([, value]) => value === maxCount)
      .map(([key]) => key)

    const queryProduct = supabase
      .from('products')
      .select(
        '*, categories(id, enTitle), manufacturers(id, title), specifications!inner(*,category_specifications!inner(id, title, units, visible, type))',
        { count: 'estimated' }
      )
      .match({
        categoryId,
        'specifications.category_specifications.visible': true
      })
      .gte('price', productsPrice.min.value)
      .lte('price', productsPrice.max.value)
      .gte('warranty', warranty.min.value)
      .lte('warranty', warranty.max.value)
      .in('id', numbersWithMaxRepetitions)
      .or(getOrFilterForSearch(search.value, 'title'))
      .range(
        currentPage.value * limit.value,
        currentPage.value * limit.value + limit.value - 1
      )
      .order(sortColumn.value, { ascending: sortAscents[sortColumn.value] })

    if (manufacturer.values.value.length) {
      queryProduct.in('manufacturerId', manufacturer.values.value)
    }

    const {
      data: productsData,
      error: productsError,
      count
    } = await queryProduct.returns<ProductWithSpecifications[]>()

    if (productsError) {
      loading.value = 'error'
      return
    }
    if (
      !productsData.length ||
      (usedSpecifications.length &&
        usedSpecifications.length !==
          new Set(data.map((e) => e.categorySpecificationsId)).size)
    ) {
      loading.value = 'empty'
      return
    }
    products.value = productsData.map((p) => {
      p.specifications = p.specifications
        .map((s) => {
          s.category_specifications.title =
            s.category_specifications.title[0].toUpperCase() +
            s.category_specifications.title.slice(1)
          return s
        })
        .sort((a, b) =>
          a.category_specifications.title.localeCompare(b.category_specifications.title)
        )
      return p
    })

    productCount.value = count ?? 0
    loading.value = 'success'
  }

  const clearFilters = () => {
    specificationsValues.value.forEach((spec) => {
      if (spec.type === 'number') {
        spec.minValue = spec.min
        spec.maxValue = spec.max
      } else {
        spec.values = []
      }
    })
    productsPrice.clear()
    warranty.clear()
    manufacturer.clear()
    search.value = ''
    currentPage.value = 0
    router.push({ query: {} })
  }

  const context = {
    products,
    loading,
    setQueryParams,
    setFilteredProducts,
    search,
    sortAscents,
    specificationsValues,
    sortColumn,
    productsPrice,
    productCount,
    currentPage,
    limit,
    manufacturer,
    warranty,
    manufacturersVariants,
    clearFilters
  }

  provide(PRODUCT_CATALOG_CONTEXT_KEY, context)

  return context
}

export const useProductCatalogContext = () => {
  const context = inject(PRODUCT_CATALOG_CONTEXT_KEY)

  if (!context) {
    throw new Error(
      'useProductCatalogContext must be used within a ProductCatalogProvider'
    )
  }

  return context
}
