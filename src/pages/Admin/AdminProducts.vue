<script setup lang="ts">
import { onBeforeMount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCategoriesStore } from '@/stores/categoriesStore'
import { useProductsStore } from '@/stores/productsStore'
import InputText from '@/components/UI/InputText.vue'
import InputFile from '@/components/UI/InputFile.vue'
import type { IcategorySpecifications } from '@/stores/categoriesStore/types'
import type { IproductC } from '@/stores/productsStore/types'
import { useManufacturersStore } from '@/stores/manufacturersStore'
import { storeToRefs } from 'pinia'
import ProdctsList from '@/components/Admin/ProductsList.vue'
import Loader from '@/components/UI/loader.vue'
import type {
  IformCategorySpecifications,
  ImanufacturerSelect,
} from '@/stores/types'

const route = useRoute()
const { manufacturers } = storeToRefs(useManufacturersStore())

const { getCategorySpecifications } = useCategoriesStore()
const { createProduct, createSpecifications } = useProductsStore()

const manufacturerSelect = ref<ImanufacturerSelect | string>('')
const categoryId = ref<number>(Number(route.params.id))
const categorySpecifications = ref<IcategorySpecifications[]>([])
const categoryFormSpecifications = ref<IformCategorySpecifications[]>([])

const copyForm: IproductC = {
  categoryId: categoryId.value,
  name: '',
  description: '',
  img: '',
  manufacturerId: {
    id: 0,
    title: '',
  },
  warranty: 0,
  price: 0,
  popularity: 0,
  quantity: 100,
  rating: 0,
  countReviews: 0,
  discount: 0,
}

const products = ref<IproductC>({ ...copyForm })

const setCategorySpecifications = async () => {
  const { data } = await getCategorySpecifications(categoryId.value)
  if (data) {
    categorySpecifications.value = data
    const mapData = data.map((e) => {
      return {
        categorySpecificationsId: e.id,
        value: '',
        productId: null,
      }
    })
    categoryFormSpecifications.value = mapData
  } else categoryFormSpecifications.value = []
}

onBeforeMount(async () => {
  setCategorySpecifications()
})

watch(
  () => route.params.id,
  (cur) => {
    if (cur) {
      categorySpecifications.value = []
      categoryId.value = Number(cur)
      setCategorySpecifications()
    }
  }
)

watch(manufacturerSelect, (cur) => {
  if (typeof cur !== 'string') {
    products.value.manufacturerId = cur
  }
})

const create = async () => {
  const { data } = await createProduct(products.value)
  if (data) {
    const productSpecifications = categoryFormSpecifications.value.map((e) => {
      return { ...e, productId: data.id }
    })
    createSpecifications(productSpecifications)
    products.value = { ...copyForm }
  }
}
</script>

<template>
  <div v-if="categorySpecifications.length">
    <form class="list__form mb-8" @submit.prevent="create">
      <div
        v-for="(specification, i) in categorySpecifications"
        :key="specification.id"
      >
        <label>
          {{ specification.title }}
        </label>
        <InputText
          v-if="specification.type"
          v-model="categoryFormSpecifications[i].value"
          type="number"
          :step="specification.max"
          :min="specification.min"
          :max="specification.max"
        />
        <InputText
          v-else
          v-model.trim="categoryFormSpecifications[i].value"
          type="text"
        />
      </div>
      <template v-if="products">
        <div>
          <label>наименование</label>
          <InputText v-model.trim="products.name" />
        </div>
        <div>
          <label>описание</label>
          <InputText v-model.trim="products.description" />
        </div>
        <div>
          <label>изображение</label>
          <InputFile v-model.trim="products.img" folder="products" />
        </div>

        <div>
          <select v-model="manufacturerSelect" required>
            <option value="" selected disabled hidden>
              выберите категорию
            </option>
            <option
              v-for="manufacturer in manufacturers"
              :key="manufacturer.id"
              :value="{ id: manufacturer.id, title: manufacturer.title }"
            >
              {{ manufacturer.title }}
            </option>
          </select>
        </div>
        <div>
          <label>гарантия</label>
          <InputText v-model="products.warranty" type="number" />
        </div>
        <div>
          <label>цена</label>
          <InputText v-model="products.price" type="number" />
        </div>
      </template>
      <div><button class="btn">создать</button></div>
    </form>
    <ProdctsList :specifications="categorySpecifications" />
  </div>
  <Loader v-else />
</template>
