<script setup lang="ts">
import { onBeforeMount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  useCategoriesStore,
  type IcategoryFields,
} from '@/stores/categoriesStore'
import {
  useProductsStore,
  type IproductForm,
  type IspetificationsForm,
} from '@/stores/productsStore'
import InputText from '@/components/UI/InputText.vue'
import InputFile from '@/components/UI/InputFile.vue'

interface IformCategoryFields extends Omit<IspetificationsForm, 'productId'> {
  productId: number | null
}

const route = useRoute()

const { getCategoryFields } = useCategoriesStore()
const { createProduct, createSpecifications } = useProductsStore()

const categoryId = ref<number>(Number(route.params.id))
const categoryFields = ref<IcategoryFields[]>([])
const categoryFormFields = ref<IformCategoryFields[]>([])

const copyForm: IproductForm = {
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
}

const products = ref<IproductForm>({ ...copyForm })

const setCategoryFields = async () => {
  const { data } = await getCategoryFields(categoryId.value)
  if (data) {
    categoryFields.value = data
    const mapData = data.map((e) => {
      return {
        categoryFieldId: e.id,
        value: '',
        productId: null,
      }
    })
    categoryFormFields.value = mapData
  } else categoryFormFields.value = []
}

onBeforeMount(async () => {
  setCategoryFields()
})

watch(
  () => route.params.id,
  (cur) => {
    if (cur) {
      categoryId.value = Number(cur)
      setCategoryFields()
    }
  }
)

const create = async () => {
  const { data } = await createProduct(products.value)
  if (data) {
    const categoryFields = categoryFormFields.value.map((e) => {
      return { ...e, productId: data.id }
    })
    createSpecifications(categoryFields)
  }
}
</script>

<template>
  <form @submit.prevent="create">
    <div class="list__form">
      <div v-for="(field, i) in categoryFields" :key="field.id">
        <label>
          {{ field.title }}
        </label>
        <InputText v-model.trim="categoryFormFields[i].value" />
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
          <InputFile v-model.trim="products.img" :required="false" />
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
    <button class="btn">создать</button>
  </form>
</template>
