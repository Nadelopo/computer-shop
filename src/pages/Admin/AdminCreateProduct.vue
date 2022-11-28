<script setup lang="ts">
import { onBeforeMount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCategoriesStore } from '@/stores/categoriesStore'
import { useProductsStore } from '@/stores/productsStore'
import InputText from '@/components/UI/InputText.vue'
import InputFile from '@/components/UI/InputFile.vue'
import type { IcategorySpecifications } from '@/stores/categoriesStore/types'
import type {
  IproductCU,
  IspetificationsCU,
} from '@/stores/productsStore/types'

interface IformCategorySpecifications
  extends Omit<IspetificationsCU, 'productId'> {
  productId: number | null
}

const route = useRoute()

const { getCategorySpecifications } = useCategoriesStore()
const { createProduct, createSpecifications } = useProductsStore()

const categoryId = ref<number>(Number(route.params.id))
const categorySpecifications = ref<IcategorySpecifications[]>([])
const categoryFormSpecifications = ref<IformCategorySpecifications[]>([])

const copyForm: IproductCU = {
  categoryId: categoryId.value,
  name: '',
  description: '',
  img: '',
  manufacturer: '',
  warranty: 0,
  price: 0,
  popularity: 0,
  quantity: 100,
  rating: 0,
  countReviews: 0,
  discount: 0,
}

const products = ref<IproductCU>({ ...copyForm })

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
      categoryId.value = Number(cur)
      setCategorySpecifications()
    }
  }
)

const create = async () => {
  const { data } = await createProduct(products.value)
  if (data) {
    const productFields = categoryFormSpecifications.value.map((e) => {
      return { ...e, productId: data.id }
    })
    createSpecifications(productFields)
  }
}
</script>

<template>
  <form @submit.prevent="create">
    <div class="list__form">
      <div
        v-for="(specification, i) in categorySpecifications"
        :key="specification.id"
      >
        <label>
          {{ specification.title }}
        </label>
        <InputText v-model.trim="categoryFormSpecifications[i].value" />
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
          <InputFile v-model.trim="products.img" />
        </div>

        <div>
          <label>производитель</label>
          <InputText v-model.trim="products.manufacturer" />
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
    </div>
    <button class="btn mt-6">создать</button>
  </form>
</template>
