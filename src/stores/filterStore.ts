import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { defineStore, storeToRefs } from 'pinia'
import { supabase } from '@/supabase'
import { useProductsStore } from './productsStore'
import { formatSearch } from '@/utils/formatSearch'
import type { PostgrestResponse } from '@supabase/supabase-js'
import type { ProductReadWithDetails } from '@/types/tables/products.types'
import type { SpecificationReadWithDetails } from '@/types/tables/specifications.types'

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
  categorySpecificationsId: {
    id: number
    enTitle: string
  }
  productId: {
    categoryId: number
    id: number
  }
}

export const useFilterStore = defineStore('filter', () => {
  const route = useRoute()
  const router = useRouter()

  const { loader, products } = storeToRefs(useProductsStore())
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
    max: 300000
  })

  async function setFilteredProducts(categoryId: number) {
    const query: {
      q: string
      [key: string]: string | string[]
    } = { q: search.value }
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

    loader.value = 'loading'
    products.value = []

    const promises = []

    for (const spec of specificationsValues.value) {
      const query = supabase
        .from('specifications')
        .select(
          'categorySpecificationsId!inner(id, enTitle), productId!inner(id, categoryId)'
        )
        .match({
          'productId.categoryId': categoryId,
          'categorySpecificationsId.id': spec.id
        })
        .ilike('productId.name', formatSearch(search.value))

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

    const idList = data.map((e) => e.map((e) => e.productId.id))

    const filteredProductsId = idList.reduce((a, b) =>
      a.filter((c) => b.includes(c))
    )

    const { data: productsData } = await supabase
      .from<ProductReadWithDetails>('products')
      .select('*, categoryId(id, enTitle), manufacturerId(id, title)')
      .in('id', filteredProductsId)
      .order(sortColumn.value, { ascending: sortAscents[sortColumn.value] })
      .lte('price', productsPrice.value.max)
      .gte('price', productsPrice.value.min)

    const { data: specificationsData } = await supabase
      .from<SpecificationReadWithDetails>('specifications')
      .select('*, categorySpecificationsId(id, title, units, visible)')
      .in('productId', productsData?.map((e) => e.id) || [])

    if (productsData && specificationsData) {
      products.value = productsData.map((p) => {
        const specifications = specificationsData
          .filter((s) => p.id === s.productId)
          .sort((a, b) =>
            a.categorySpecificationsId.title.localeCompare(
              b.categorySpecificationsId.title
            )
          )
        return { ...p, specifications }
      })
    }

    loader.value = 'success'
  }

  return {
    setFilteredProducts,
    search,
    sortAscents,
    specificationsValues,
    sortColumn,
    productsPrice
  }
})
