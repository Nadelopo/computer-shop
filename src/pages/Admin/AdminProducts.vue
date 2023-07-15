<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useCategoriesStore } from '@/stores/categoriesStore'
import { useProductsStore } from '@/stores/productsStore'
import { useManufacturersStore } from '@/stores/manufacturersStore'
import VInputText from '@/components/UI/VInputText.vue'
import VInputFile from '@/components/UI/VInputFile.vue'
import ProdctsList from '@/components/Admin/ProductsList.vue'
import VLoader from '@/components/UI/VLoader.vue'
import VButton from '@/components/UI/VButton.vue'
import VSelect from '@/components/UI/VSelect.vue'
import { loadingKey, setProductsKey } from './types'
import type { CategorySpecificationRead } from '@/types/tables/categorySpecifications.types'
import type { SpecificationCreate } from '@/types/tables/specifications.types'
import type { ProductCreate } from '@/types/tables/products.types'

type ProductSpecificationForm = Omit<SpecificationCreate, 'productId'> & {
  productId: number | null
}

const route = useRoute()

const setProducts = inject(setProductsKey, () => {})
const loading = inject(loadingKey)

const { manufacturers } = storeToRefs(useManufacturersStore())
const { getCategorySpecifications } = useCategoriesStore()
const { createProduct, createSpecifications } = useProductsStore()

const manufacturerSelect = ref<number | string>('')
const categoryId = computed(() => Number(route.params.id))
const categorySpecifications = ref<CategorySpecificationRead[]>([])
const categoryFormSpecifications = ref<ProductSpecificationForm[]>([])

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
  const data = await getCategorySpecifications(categoryId.value)
  if (data) {
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
  } else categoryFormSpecifications.value = []
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
  const data = await createProduct(product.value)
  if (data) {
    const productSpecifications = categoryFormSpecifications.value.map((e) => {
      return { ...e, productId: data.id }
    })
    await createSpecifications(productSpecifications)
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
}
</script>

<template>
  <div v-if="categorySpecifications.length && loading === 'success'">
    <form class="list__form mb-8" @submit.prevent="create">
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
          <v-input-file v-model.trim="product.img" folder="products" />
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
          <v-input-text v-model="product.warranty" type="number" />
        </div>
        <div>
          <label>цена</label>
          <v-input-text v-model="product.price" type="number" />
        </div>
      </template>
      <div><v-button>создать</v-button></div>
    </form>
    <ProdctsList :specifications="categorySpecifications" />
  </div>
  <div v-else class="h-screen flex items-center">
    <v-loader />
  </div>
</template>
