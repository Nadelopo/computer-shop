<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useBreakpoints } from '@/utils/useBreakpoints'
import { useProductsStore } from '@/stores/productsStore'
import ProductsForm from '@/components/Admin/Products/ProductsForm.vue'
import ProductsList from '@/components/Admin/Products/ProductsList.vue'
import { VPagination } from '@/components/UI'
import type { CategorySpecificationRead } from '@/types/tables/categorySpecifications.types'
import type { ProductWithSpecifications } from '@/types/tables/products.types'
import type { Loading } from '@/types'

const { getProducts } = useProductsStore()

const page = ref(0)
const limit = ref(6)
const loadingProducts = ref<Loading>('loading')
useBreakpoints(
  [5, 4, 3, 2, 1],
  (current) => {
    page.value = 0
    if (current === 'noOne') {
      limit.value = 6
      return
    }
    limit.value = current
  },
  {
    points: [1850, 1570, 1340, 1140, 940],
    onUpdate: (current) => {
      if (current === 'noOne' && limit.value === 6) {
        loadingProducts.value = 'success'
        return
      }
      if (current === limit.value) {
        loadingProducts.value = 'success'
        return
      }
      loadingProducts.value = 'loading'
    },
    delay: 500
  }
)

const products = ref<ProductWithSpecifications[]>([])
const productCount = ref(0)
const route = useRoute()
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
watch([page, limit], setProducts)

watch(
  () => route.params.id,
  (id) => {
    if (id) {
      setProducts()
    }
  },
  { immediate: true }
)

const categorySpecifications = ref<CategorySpecificationRead[]>([])
</script>

<template>
  <div>
    <products-form
      v-model="categorySpecifications"
      @create-product="setProducts"
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
    />
  </div>
</template>
