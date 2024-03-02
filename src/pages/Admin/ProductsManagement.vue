<script setup lang="ts">
import { ref, watch, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useProductsStore } from '@/stores/productsStore'
import { useCategoriesStore } from '@/stores/categoriesStore'
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

const { getProducts } = useProductsStore()

const route = useRoute()
const page = ref(route.query.page ? Number(route.query.page) - 1 : 0)
const limit = ref(6)
const loadingProducts = ref<Loading>('loading')
const products = ref<ProductWithSpecifications[]>([])
const productCount = ref(0)
const setProducts = async () => {
  const categoryId = Number(route.params.id)
  if (categoryId) {
    loadingProducts.value = 'loading'
    const { data, count, error } = await getProducts(categoryId, {
      limit: limit.value,
      page: page.value
    })
    if (error) {
      loadingProducts.value = 'error'
      return error
    }
    products.value = data
    if (count !== null) {
      productCount.value = count
    }

    if (products.value.length === 0) {
      loadingProducts.value = 'empty'
    } else {
      loadingProducts.value = 'success'
    }
  }
}
watch([page, limit, () => route.params.id], setProducts, {
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
  quantity: 100,
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
      } else {
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
    }
  )
})

const { createProduct } = useProductsStore()
const { createSpecifications } = useProductsStore()
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
  const { data, error } = await createProduct(product.value)
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
  const { error: errorSpecifications } = await createSpecifications(
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
    } else {
      return { ...e, valueString: [] }
    }
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
