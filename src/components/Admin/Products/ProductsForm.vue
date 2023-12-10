<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useCategoriesStore } from '@/stores/categoriesStore'
import { useManufacturersStore } from '@/stores/manufacturersStore'
import { useProductsStore } from '@/stores/productsStore'
import {
  VInputText,
  VLoader,
  VButton,
  VSelect,
  VInputFile,
  VButtons
} from '@/components/UI'
import type { InputFileActions } from '@/components/UI/VInputFile/types'
import type { ProductCreate } from '@/types/tables/products.types'
import type { Loading } from '@/types'
import type { CategorySpecificationRead } from '@/types/tables/categorySpecifications.types'
import type { SpecificationCreate } from '@/types/tables/specifications.types'

type ProductSpecificationForm = Omit<SpecificationCreate, 'productId'> & {
  productId: number | null
}

const categorySpecifications = defineModel<CategorySpecificationRead[]>({
  required: true
})

const emit = defineEmits<{
  createProduct: []
}>()

const { manufacturers } = storeToRefs(useManufacturersStore())
const { getCategorySpecifications } = useCategoriesStore()
const { createProduct, createSpecifications } = useProductsStore()

const route = useRoute()
const categoryFormSpecifications = ref<ProductSpecificationForm[]>([])
const loadingSpecifications = ref<Loading>('loading')
const setCategorySpecifications = async () => {
  loadingSpecifications.value = 'loading'
  categorySpecifications.value = []
  const { data, error } = await getCategorySpecifications(
    Number(route.params.id)
  )
  if (error) {
    loadingSpecifications.value = 'error'
    return error
  }
  categorySpecifications.value = data
  categoryFormSpecifications.value = data.map((e) => {
    if (e.type === 'number') {
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
        valueString: [''],
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

const copyForm: ProductCreate = {
  categoryId: Number(route.params.id),
  name: '',
  description: '',
  img: [],
  manufacturerId: 0,
  warranty: 0,
  price: 0,
  priceWithoutDiscount: 0,
  quantity: 100,
  discount: 0
}
const product = ref<ProductCreate>({ ...copyForm })
const loadingCreateProduct = ref<Loading>('success')
const inputFileRef = ref<InputFileActions<string[]>>()
const create = async () => {
  loadingCreateProduct.value = 'loading'
  const { url, error: errorImage } = (await inputFileRef.value?.onSave()) || {}
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
  emit('createProduct')
  loadingCreateProduct.value = 'success'
  product.value = { ...copyForm }
  inputFileRef.value?.clear()

  categoryFormSpecifications.value = categoryFormSpecifications.value.map(
    (e, i) => {
      const specificationsValue = categorySpecifications.value[i]
      if (specificationsValue.type === 'number') {
        return { ...e, valueNumber: specificationsValue.min }
      } else {
        return { ...e, valueString: [''] }
      }
    }
  )
}

watchEffect(() => {
  const id = route.params.id
  if (!id) return
  setCategorySpecifications()
  product.value.categoryId = Number(id)
})
</script>

<template>
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
      <template v-if="specification.type === 'number'">
        <v-input-text
          v-model="categoryFormSpecifications[i].valueNumber"
          type="number"
          :step="specification.step"
          :min="specification.min"
          :max="specification.max"
        />
      </template>
      <template v-else-if="specification.type === 'string'">
        <br />
        <v-select
          v-model="categoryFormSpecifications[i].valueString![0]"
          :options="
            specification.variantsValues.map((e) => ({
              title: e,
              value: e
            }))
          "
          class="mt-4"
        />
      </template>
      <template v-else>
        <v-buttons
          :model-value="categoryFormSpecifications[i].valueString!"
          :options="
            specification.variantsValues.map((v) => ({ title: v, value: v }))
          "
          @update:model-value="
            categoryFormSpecifications[i].valueString = $event
          "
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
          ref="inputFileRef"
          :file-url="product.img"
          folder="products"
          multiple
        />
      </div>

      <div>
        <label>производитель</label>
        <div>
          <v-select
            v-model="product.manufacturerId"
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
          v-model="product.priceWithoutDiscount"
          type="number"
        />
      </div>
    </template>
    <div>
      <v-button :loading="loadingCreateProduct === 'loading'">создать</v-button>
    </div>
  </form>
  <div
    v-else-if="loadingSpecifications === 'loading'"
    class="h-[50vh] flex items-center"
  >
    <v-loader />
  </div>
  <div
    v-else-if="loadingSpecifications === 'empty'"
    class="text-2xl text-center font-normal mt-16"
  >
    Характеристики категории отсутствуют
  </div>
</template>
