<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useCategoriesStore } from '@/stores/categoriesStore'
import { useProductsStore } from '@/stores/productsStore'
import { useManufacturersStore } from '@/stores/manufacturersStore'
import ProdctsList from '@/components/Admin/ProductsList.vue'
import {
  VInputText,
  VInputFile,
  VPagination,
  VLoader,
  VButton,
  VSelect
} from '@/components/UI'
import type { CategorySpecificationRead } from '@/types/tables/categorySpecifications.types'
import type { SpecificationCreate } from '@/types/tables/specifications.types'
import type {
  ProductCreate,
  ProductWithSpecifications
} from '@/types/tables/products.types'
import type { Loading } from '@/types'

type ProductSpecificationForm = Omit<SpecificationCreate, 'productId'> & {
  productId: number | null
}

const route = useRoute()

const loadingProducts = ref<Loading>('loading')
const loadingCreateProduct = ref<Loading>('loading')
const products = ref<ProductWithSpecifications[]>([])

const { manufacturers } = storeToRefs(useManufacturersStore())
const { getCategorySpecifications } = useCategoriesStore()
const { createProduct, createSpecifications, getProducts } = useProductsStore()

const manufacturerSelect = ref<number | string>('')
const categoryId = computed(() => Number(route.params.id))
const categorySpecifications = ref<CategorySpecificationRead[]>([])
const loadingSpecifications = ref<Loading>('loading')
const categoryFormSpecifications = ref<ProductSpecificationForm[]>([])
const page = ref(0)
const limit = ref(6)
const productCount = ref(0)

const breakpoints = [
  { width: 1850, limit: 5 },
  { width: 1570, limit: 4 },
  { width: 1340, limit: 3 },
  { width: 1140, limit: 2 },
  { width: 940, limit: 1 }
]

for (const breakpoint of breakpoints) {
  if (window.outerWidth <= breakpoint.width) {
    limit.value = breakpoint.limit
  }
}

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

watch(page, setProducts)

const copyForm: ProductCreate = {
  categoryId: categoryId.value,
  name: '',
  description: '',
  img: '',
  manufacturerId: 0,
  warranty: 0,
  price: 0,
  quantity: 100,
  discount: 0
}

const product = ref<ProductCreate>({ ...copyForm })

const setCategorySpecifications = async () => {
  loadingSpecifications.value = 'loading'
  const { data, error } = await getCategorySpecifications(categoryId.value)
  if (error) {
    loadingSpecifications.value = 'error'
    return error
  }
  categorySpecifications.value = data
  categoryFormSpecifications.value = data.map((e) => {
    if (e.type) {
      return {
        categorySpecificationsId: e.id,
        productId: null,
        valueString: null,
        valueNumber: 0
      }
    } else {
      return {
        categorySpecificationsId: e.id,
        productId: null,
        valueString: '',
        valueNumber: null
      }
    }
  })
  if (data.length === 0) {
    loadingSpecifications.value = 'empty'
    categoryFormSpecifications.value = []
    return
  }
  loadingSpecifications.value = 'success'
}

watch(
  () => route.params.id,
  (cur) => {
    if (cur) {
      categorySpecifications.value = []
      setCategorySpecifications()
      product.value.categoryId = categoryId.value
      setProducts()
    }
  },
  { immediate: true }
)

watch(manufacturerSelect, (cur) => {
  if (typeof cur !== 'string') {
    product.value.manufacturerId = cur
  }
})

const create = async () => {
  const { data, error } = await createProduct(product.value)
  if (error) {
    loadingCreateProduct.value = 'error'
    return
  }

  const productSpecifications = categoryFormSpecifications.value.map((e) => {
    return { ...e, productId: data.id }
  })
  const { error: errorSpecifications } = await createSpecifications(
    productSpecifications
  )
  if (errorSpecifications) {
    loadingCreateProduct.value = 'error'
    return
  }
  setProducts()
  product.value = { ...copyForm }
  categoryFormSpecifications.value = categoryFormSpecifications.value.map(
    (e, i) => {
      const specificationsValue = categorySpecifications.value[i]
      if (specificationsValue.type) {
        return { ...e, valueNumber: specificationsValue.min }
      } else {
        return { ...e, valueString: '' }
      }
    }
  )
}
</script>

<template>
  <div>
    <form
      v-if="loadingSpecifications === 'success'"
      class="list__form mb-8"
      @submit.prevent="create"
    >
      <div
        v-for="(specification, i) in categorySpecifications"
        :key="specification.id"
      >
        <label>
          {{ specification.title }}
        </label>
        <template v-if="specification.type">
          <v-input-text
            v-model="categoryFormSpecifications[i].valueNumber"
            type="number"
            :step="specification.step"
            :min="specification.min"
            :max="specification.max"
          />
        </template>
        <template v-else-if="specification.variantsValues">
          <br />
          <v-select
            v-model="categoryFormSpecifications[i].valueString"
            :options="
              specification.variantsValues.map((e) => ({
                title: e,
                value: e
              }))
            "
            class="mt-4"
          />
        </template>
      </div>
      <template v-if="product">
        <div>
          <label>наименование</label>
          <v-input-text v-model.trim="product.name" />
        </div>
        <div>
          <label>описание</label>
          <v-input-text v-model.trim="product.description" />
        </div>
        <div>
          <label>изображение</label>
          <v-input-file
            v-model.trim="product.img"
            folder="products"
          />
        </div>

        <div>
          <label>производитель</label>
          <div>
            <v-select
              v-model="manufacturerSelect"
              :options="
                manufacturers.map((e) => ({ value: e.id, title: e.title }))
              "
              class="mt-4"
            />
          </div>
        </div>
        <div>
          <label>гарантия</label>
          <v-input-text
            v-model="product.warranty"
            type="number"
          />
        </div>
        <div>
          <label>цена</label>
          <v-input-text
            v-model="product.price"
            type="number"
          />
        </div>
      </template>
      <div><v-button>создать</v-button></div>
    </form>
    <div
      v-else
      class="h-[50vh] flex items-center"
    >
      <v-loader />
    </div>
    <ProdctsList
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
