import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/db/supabase'
import { getAll } from '@/db/queries/tables'
import { formatSearch } from '@/utils/formatSearch'
import {
  useFeatureNumberStaticFilter,
  useFeatureStringStaticFilter
} from '@/components/CategoryProducts/useFeatureStaticFilter'
import type { RouteLocationNormalizedLoaded, Router } from 'vue-router'
import type { ProductWithSpecifications } from '@/types/tables/products.types'
import type { Loading } from '@/types'
import type { PostgrestError } from '@supabase/supabase-js'
import type { CategorySpecificationRead } from '@/types/tables/categorySpecifications.types'

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
    countReviews: true,
    discount: true,
    popularity: false,
    rating: true
  })
  const sortColumn = ref<SortType>('popularity')
  const search = ref('')
  const productsPrice = useFeatureNumberStaticFilter({
    max: 300_000
  })
  const manufacturer = useFeatureStringStaticFilter()
  const warranty = useFeatureNumberStaticFilter({
    max: 72,
    visibility: false
  })

  const products = ref<ProductWithSpecifications[]>([])
  const productCount = ref(0)
  const limit = ref(5)
  const currentPage = ref(0)
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
      if (value.type === 'number') {
        query[value.enTitle] = `${value.minValue}_${value.maxValue}`
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
  }

  async function setFilteredProducts(categoryId: number): Promise<void> {
    loading.value = 'loading'
    products.value = []

    const promises = []
    for (const specification of specificationsValues.value) {
      const query = supabase
        .from('specifications')
        .select('products!inner(id)')
        .match({
          'products.categoryId': categoryId,
          categorySpecificationsId: specification.id
        })
        .ilike('products.name', formatSearch(search.value))

      if (specification.type === 'number') {
        query
          .gte('valueNumber', specification.minValue)
          .lte('valueNumber', specification.maxValue)
      } else {
        if (specification.values.length) {
          query.overlaps('valueString', specification.values)
        }
      }
      promises.push(query.returns<QueryData[]>())
    }

    const results = await Promise.all(promises)

    let errorFilters: PostgrestError | null = null
    const data = results
      .map((e) => {
        if (e.error) {
          errorFilters = e.error
        }
        return e.data
      })
      .filter((e): e is NonNullable<typeof e> => e !== null)
    if (errorFilters) {
      loading.value = 'error'
      return
    }
    const idList = data.map((e) => e.map((e) => e.products.id))
    const filteredProductsId = idList.reduce((a, b) =>
      a.filter((c) => b.includes(c))
    )
    const productsIn: Partial<Record<'id' | 'manufacturerId', number[]>> = {
      id: filteredProductsId
    }
    if (manufacturer.values.value.length) {
      productsIn.manufacturerId = manufacturer.values.value
    }
    const {
      data: productsData,
      count,
      error
    } = await getAll('products', {
      select: '*, categories(id, enTitle), manufacturers(id, title)',
      in: productsIn,
      order: [sortColumn.value, sortAscents[sortColumn.value]],
      between: [
        {
          column: 'price',
          begin: productsPrice.min.value,
          end: productsPrice.max.value
        },
        {
          column: 'warranty',
          begin: warranty.min.value,
          end: warranty.max.value
        }
      ],
      range: [
        currentPage.value * limit.value,
        currentPage.value * limit.value + limit.value - 1
      ]
    })
    if (error) {
      loading.value = 'error'
      return
    }

    const { data: specificationsData, error: errorSpecifications } =
      await getAll('specifications', {
        select: '*, category_specifications(id, title, units, visible, type)',
        in: { productId: productsData?.map((e) => e.id) || [] }
      })
    if (errorSpecifications) {
      loading.value = 'error'
      return
    }
    productCount.value = count ?? 0

    if (productsData && specificationsData) {
      products.value = productsData.map((p) => {
        const specifications = specificationsData
          .filter((s) => p.id === s.productId)
          .map((s) => {
            s.category_specifications.title =
              s.category_specifications.title[0].toUpperCase() +
              s.category_specifications.title.slice(1)
            return s
          })
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
    limit,
    manufacturer,
    warranty
  }
})
