<script setup lang="ts">
import { ref, watch, watchEffect } from 'vue'
import type { PostgrestError } from '@supabase/supabase-js'
import { useCustomRoute } from '@/utils/customRouter'
import { getProductQuantity } from '@/utils/getProductQuantity'
import { useCategoriesStore } from '@/stores/categoriesStore'
import { createMany, createOne, getAll, getOneById } from '@/db/queries/tables'
import ProductsList from '@/components/Admin/Products/ProductsList.vue'
import { VPagination } from '@/components/UI'
import ProductsForm from '@/components/Admin/Products/ProductsForm.vue'
import type { CategorySpecificationRead } from '@/types/tables/categorySpecifications.types'
import type {
  ProductCreate,
  ProductWithSpecifications
} from '@/types/tables/products.types'
import type { Loading } from '@/types'
import type { SpecificationCreate } from '@/types/tables/specifications.types'
import type { SpecificationCreateForm } from '@/components/Admin/Products/types'
import type { InputFileActions } from '@/components/UI/VInputFile/types'

const route = useCustomRoute('AdminProducts')
const page = ref(Number(route.query.page) - 1 || 0)
const limit = ref(6)
const search = ref('')
const loadingProducts = ref<Loading>('loading')
const products = ref<ProductWithSpecifications[]>([])
const productCount = ref(0)
const setProducts = async () => {
  const categoryId = Number(route.params.id)
  if (!categoryId) return
  loadingProducts.value = 'loading'
  let error: PostgrestError | null = null
  const select =
    '*, categories(id, enTitle), manufacturers(id, title), specifications(*,  category_specifications(id, title, units, visible, type)), product_quantity_in_stores(quantity)'
  if (search.value[0] === '#') {
    const result = await getOneById(
      'products',
      Number(search.value.slice(1)),
      select
    )
    if (result.data) {
      products.value = [
        {
          ...result.data,
          quantity: getProductQuantity(result.data.product_quantity_in_stores)
        }
      ]
    }
    productCount.value = 0
    if (result.error?.code === 'PGRST116') {
      loadingProducts.value = 'empty'
      return
    }
    error = result.error
  } else {
    const limitValue = limit.value
    const result = await getAll('products', {
      match: { categoryId },
      select,
      range: [
        page.value * limitValue,
        page.value * limitValue + limitValue - 1
      ],
      search: ['title', search.value],
      order: [
        ['id'],
        ['categorySpecificationsId', { foreignTable: 'specifications' }]
      ]
    })
    if (result.data) {
      products.value = result.data.map((p) => ({
        ...p,
        quantity: getProductQuantity(p.product_quantity_in_stores)
      }))
    }
    error = result.error
    productCount.value = result.count ?? 0
  }

  if (error) {
    loadingProducts.value = 'error'
    return
  }

  if (products.value.length === 0) {
    loadingProducts.value = 'empty'
  } else {
    loadingProducts.value = 'success'
  }
}
watch([page, limit, search, () => route.params.id], setProducts, {
  immediate: true
})

const { getCategorySpecifications } = useCategoriesStore()
const loadingSpecifications = ref<Loading>('loading')
const categorySpecifications = ref<CategorySpecificationRead[]>([])
const setCategorySpecifications = async () => {
  loadingSpecifications.value = 'loading'
  const { data, error } = await getCategorySpecifications(
    Number(route.params.id)
  )
  if (error) {
    loadingSpecifications.value = 'error'
    return
  }
  categorySpecifications.value = data
  loadingSpecifications.value = 'success'
}
watch(() => route.params.id, setCategorySpecifications, {
  immediate: true,
  flush: 'post'
})

const emptyProductFields: ProductCreate = {
  title: '',
  description: '',
  price: 0,
  categoryId: 0,
  manufacturerId: 0,
  img: [],
  priceWithoutDiscount: 0,
  warranty: 0,
  discount: 0
}

const productSpecifications = ref<SpecificationCreateForm[]>([])

watchEffect(() => {
  productSpecifications.value = categorySpecifications.value.map(
    (categorySpecification) => {
      const staticFields = {
        productId: undefined,
        categorySpecificationsId: categorySpecification.id,
        title: categorySpecification.title
      }
      if (categorySpecification.type === 'number') {
        const { max, min, step } = categorySpecification
        return {
          ...staticFields,
          type: categorySpecification.type,
          valueNumber: 0,
          valueString: null,
          max,
          min,
          step
        }
      }
      return {
        ...staticFields,
        valueNumber: null,
        type: categorySpecification.type,
        valueString: [],
        variantsValues: categorySpecification.variantsValues,
        max: null,
        min: null,
        step: null
      }
    }
  )
})

const loadingCreateProduct = ref<Loading>('success')
const product = ref<ProductCreate>({ ...emptyProductFields })
const create = async (fileActions: InputFileActions<string[]> | undefined) => {
  loadingCreateProduct.value = 'loading'
  const { url, error: errorImage } = (await fileActions?.onSave()) || {}
  if (errorImage) {
    loadingCreateProduct.value = 'error'
    return
  }
  if (url) {
    product.value.img = url
  }
  product.value.price = Math.round(
    product.value.discount
      ? product.value.priceWithoutDiscount -
          (product.value.priceWithoutDiscount * product.value.discount) / 100
      : product.value.priceWithoutDiscount
  )
  const { data, error } = await createOne('products', product.value)
  if (error) {
    loadingCreateProduct.value = 'error'
    return
  }

  const specifications: SpecificationCreate[] = productSpecifications.value.map(
    (s) => {
      const { categorySpecificationsId, valueNumber, valueString } = s
      return {
        categorySpecificationsId,
        productId: data.id,
        valueNumber,
        valueString
      }
    }
  )
  const { error: errorSpecifications } = await createMany(
    'specifications',
    specifications
  )
  if (errorSpecifications) {
    loadingCreateProduct.value = 'error'
    return
  }
  loadingCreateProduct.value = 'success'
  setProducts()
  product.value = { ...emptyProductFields }
  fileActions?.clear()

  productSpecifications.value = productSpecifications.value.map((e, i) => {
    const specificationsValue = categorySpecifications.value[i]
    if (e.type === 'number') {
      return { ...e, valueNumber: specificationsValue.min as number }
    }
    return { ...e, valueString: [] }
  })
}
</script>

<template>
  <div>
    <products-form
      v-model="product"
      v-model:specifications="productSpecifications"
      type="create"
      :loading-data="loadingSpecifications"
      :loading-submit="loadingCreateProduct"
      @submit="create"
    />
    <products-list
      v-model:products="products"
      v-model:search="search"
      :specifications="categorySpecifications"
      :loading="loadingProducts"
    />
    <v-pagination
      v-model="page"
      :page-size="limit"
      :item-count="productCount"
      class="my-8"
      @click="$router.push({ query: { ...route.query, page: page + 1 } })"
    />
  </div>
</template>
