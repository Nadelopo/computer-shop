import { reactive, ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { supabase } from '@/supabase'
import { useProductsStore } from './productsStore'
import { formatSearch } from '@/utils/formatSearch'
import type { PostgrestResponse } from '@supabase/supabase-js'
import type { ProductReadWithDetails } from '@/types/tables/products.types'
import type { SpecificationReadWithDetails } from '@/types/tables/specifications.types'

export type SpecificationsValues =
  | {
      id: number
      minValue: number
      maxValue: number
      type: true
      enTitle: string
    }
  | {
      id: number
      variantsValues: string[]
      type: false
      enTitle: string
    }

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

  async function setFilteredProducts(categoryId: number) {
    loader.value = 'loading'
    products.value = []

    const arrayPoructId: number[][] = []

    for (const spec of specificationsValues.value) {
      let query = supabase
        .from('specifications')
        .select(
          'categorySpecificationsId!inner(id, enTitle), productId!inner(id, categoryId)'
        )
        .match({
          'productId.categoryId': categoryId,
          'categorySpecificationsId.id': spec.id
        })
        .ilike('productId.name', formatSearch(search.value))

      arrayPoructId.push([])

      if (spec.type) {
        query = query.gte('valueNumber', spec.minValue)
        query = query.lte('valueNumber', spec.maxValue)
      } else {
        if (spec.variantsValues.length) {
          query = query.in('valueString', spec.variantsValues)
        }
      }
      const { data, error }: PostgrestResponse<QueryData> = await query
      if (error) console.log(error)
      if (data) {
        for (const el of data) {
          arrayPoructId.at(-1)?.push(el.productId.id)
        }
      }
    }

    const filteredProductsId = arrayPoructId[0].filter((value) => {
      return arrayPoructId.every((arr) => arr.includes(value))
    })

    const { data: queryProducts } = await supabase
      .from<ProductReadWithDetails>('products')
      .select('*, categoryId(id, enTitle), manufacturerId(id, title)')
      .in('id', filteredProductsId)
      .order(sortColumn.value, { ascending: sortAscents[sortColumn.value] })

    const { data: specData } = await supabase
      .from<SpecificationReadWithDetails>('specifications')
      .select('*, categorySpecificationsId(id, title, units, visible)')
      .in('productId', filteredProductsId)

    if (queryProducts && specData) {
      products.value = queryProducts.map((p) => {
        const specifications = specData
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
    sortColumn
  }
})
