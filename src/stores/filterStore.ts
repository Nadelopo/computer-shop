import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/supabase'
import { formatSearch } from '@/utils/formatSearch'
import type { RouteLocationNormalizedLoaded, Router } from 'vue-router'
import type { PostgrestResponse } from '@supabase/supabase-js'
import type {
  ProductReadWithDetails,
  ProductWithSpecifications
} from '@/types/tables/products.types'
import type { SpecificationReadWithDetails } from '@/types/tables/specifications.types'
import type { Loading } from '@/types'

type SpecificationsValues = {
  id: number
  enTitle: string
  title: string
} & (
  | {
      min: number
      max: number
      step: number
      minValue: number
      maxValue: number
      type: true
    }
  | {
      variantsValues: string[]
      values: string[]
      type: false
    }
)

export type CheckboxData = {
  id: number
  title: string
}

type QueryData = {
  products: {
    id: number
  }
}

export const useFilterStore = defineStore('filter', () => {
  type SortType = keyof typeof sortAscents
  const specificationsValues = ref<SpecificationsValues[]>([])

  const sortAscents = reactive({
    price: true,
    countReviews: false,
    discount: true,
    popularity: false,
    rating: false
  })
  const sortColumn = ref<SortType>('popularity')
  const search = ref('')
  const productsPrice = ref<{ min: number; max: number }>({
    min: 0,
    max: 300_000
  })

  const products = ref<ProductWithSpecifications[]>([])
  const productCount = ref(0)
  const limit = ref(5)
  const currentPage = ref<number>(0)
  const loading = ref<Loading>('loading')

  function setQueryParams(
    router: Router,
    route: RouteLocationNormalizedLoaded
  ) {
    const query: {
      q: string
      [key: string]: number | string | string[]
    } = { page: 1, q: search.value }
    for (const value of specificationsValues.value) {
      if (value.type) {
        query[value.enTitle] = `${value.minValue}_${value.maxValue}`
      } else {
        query[value.enTitle] = value.values
      }
    }
    router.push({
      query: {
        ...route.query,
        ...query,
        price: `${productsPrice.value.min}_${productsPrice.value.max}`
      }
    })
  }

  async function setFilteredProducts(categoryId: number): Promise<void> {
    loading.value = 'loading'
    products.value = []

    const promises = []
    for (const spec of specificationsValues.value) {
      const query = supabase
        .from('specifications')
        .select('products!inner(id)')
        .match({
          'products.categoryId': categoryId,
          categorySpecificationsId: spec.id
        })
        .ilike('products.name', formatSearch(search.value))

      if (spec.type) {
        query
          .gte('valueNumber', spec.minValue)
          .lte('valueNumber', spec.maxValue)
      } else {
        if (spec.values.length) {
          query.in('valueString', spec.values)
        }
      }
      promises.push(query)
    }
    const results: PostgrestResponse<QueryData>[] = await Promise.all(promises)

    const data = results
      .map((e) => e.data)
      .filter((e): e is QueryData[] => e !== null)

    const idList = data.map((e) => e.map((e) => e.products.id))

    const filteredProductsId = idList.reduce((a, b) =>
      a.filter((c) => b.includes(c))
    )

    const { data: productsData, count } = await supabase
      .from<ProductReadWithDetails>('products')
      .select('*, categories(id, enTitle), manufacturers(id, title)', {
        count: 'exact'
      })
      .in('id', filteredProductsId)
      .order(sortColumn.value, { ascending: sortAscents[sortColumn.value] })
      .lte('price', productsPrice.value.max)
      .gte('price', productsPrice.value.min)
      .range(
        currentPage.value * limit.value,
        currentPage.value * limit.value + limit.value - 1
      )

    const { data: specificationsData } = await supabase
      .from<SpecificationReadWithDetails>('specifications')
      .select('*, category_specifications(id, title, units, visible)')
      .in('productId', productsData?.map((e) => e.id) || [])

    productCount.value = count ?? 0

    if (productsData && specificationsData) {
      products.value = productsData.map((p) => {
        const specifications = specificationsData
          .filter((s) => p.id === s.productId)
          .sort((a, b) =>
            a.category_specifications.title.localeCompare(
              b.category_specifications.title
            )
          )
        return { ...p, specifications }
      })
    }
    if (productCount.value === 0) {
      loading.value = 'empty'
    } else {
      loading.value = 'success'
    }
  }

  return {
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
    limit
  }
})
