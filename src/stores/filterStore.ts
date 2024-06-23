import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/db/supabase'
import { getOrFilterForSearch } from '@/utils/getOrFilterForSearch'
import {
  useFeatureNumberStaticFilter,
  useFeatureStringStaticFilter
} from '@/components/CategoryProducts/useFeatureStaticFilter'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import type { ProductWithSpecifications } from '@/types/tables/products.types'
import type { Loading } from '@/types'
import type { CategorySpecificationRead } from '@/types/tables/categorySpecifications.types'
import type { CustomRouter } from '@/utils/customRouter'

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
    router: CustomRouter,
    route: RouteLocationNormalizedLoaded
  ) {
    const query: {
      q: string | undefined
      page: number | undefined
      [key: string]: undefined | number | string | string[]
    } = { page: currentPage.value || undefined, q: search.value || undefined }
    for (const value of specificationsValues.value) {
      if (value.type === 'number') {
        const isNotDefaultValues =
          value.minValue !== 0 || value.maxValue !== value.max
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
      } else {
        if (specification.values.length) {
          let v = ''
          for (const value of specification.values) {
            v += `valueString.cs.{${value}},`
          }

          console.log(v)
          or += `and(categorySpecificationsId.eq.${
            specification.id
          },or(${v.slice(0, -1)})),`
          usedSpecifications.push(specification.id)
        }
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
    console.log(
      data.map((e) => e.products?.id),
      error,
      usedSpecifications.length
    )
    console.log(or)
    let idList = data
      .map((e) => e.products?.id)
      .filter((e): e is number => Boolean(e))

    idList = idList.filter((e) => {
      const count = idList.filter((v) => v === e).length
      return count >= usedSpecifications.length
    })
    if (!idList.length) {
      loading.value = 'empty'
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

    console.log(usedSpecifications, numbersWithMaxRepetitions)
    const queryProduct = supabase
      .from('products')
      .select(
        '*, categories(id, enTitle), manufacturers(id, title), specifications(*,category_specifications(id, title, units, visible, type))',
        { count: 'estimated' }
      )
      .eq('categoryId', categoryId)
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
    console.log(productsData)
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
          a.category_specifications.title.localeCompare(
            b.category_specifications.title
          )
        )
      return p
    })
    productCount.value = count ?? 0
    loading.value = 'success'
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
