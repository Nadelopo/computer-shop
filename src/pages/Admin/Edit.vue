<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useProductsStore } from '@/stores/productsStore'
import { useManufacturersStore } from '@/stores/manufacturersStore'
import InputText from '@/components/UI/InputText.vue'
import InputFile from '@/components/UI/InputFile.vue'

import Loader from '@/components/UI/loader.vue'
import type {
  ImanufacturerSelect,
  IproductSpecificationOnEdit,
  IproductWithSpecificationsOnEdit,
} from '@/types'
import type {
  IproductR,
  IproductSpecificationU,
  IproductU,
} from '@/types/tables'
import { getAllByColumn, getOneWithId } from '@/utils/dbQueries'

const { updateProduct, updateProductSpecifications } = useProductsStore()
const { manufacturers } = storeToRefs(useManufacturersStore())

const router = useRouter()
const route = useRoute()

const id = Number(route.params.id)
const product = ref<IproductWithSpecificationsOnEdit | null>(null)

const manufacturerSelect = ref<ImanufacturerSelect | string>('')

onBeforeMount(async () => {
  const { data } = await getOneWithId<IproductR>(
    'products',
    id,
    '*, manufacturerId(id, title)'
  )
  const spec = await getAllByColumn<IproductSpecificationOnEdit>(
    'specifications',
    'productId',
    id,
    'id, value, productId, categorySpecificationsId(id, title,  visible, units, type, step, min, max, variantsValues)'
  )

  if (data && spec.data) {
    const sortSpec = spec.data.sort((a, b) =>
      a.categorySpecificationsId.title.localeCompare(
        b.categorySpecificationsId.title
      )
    )
    manufacturerSelect.value = data.manufacturerId
    product.value = { ...data, specifications: sortSpec }
  }
})

const save = async () => {
  if (product.value) {
    const productU: IproductU = {
      name: product.value.name,
      description: product.value.description,
      img: product.value.img,
      manufacturerId: product.value.manufacturerId.id,
      warranty: product.value.warranty,
      price: product.value.price,
      discount: product.value.discount,
      quantity: product.value.quantity,
    }

    const newSpecifications: IproductSpecificationU[] =
      product.value.specifications.map((spec) => {
        return { id: spec.id, value: spec.value }
      })
    console.log(product.value.specifications)
    console.log(newSpecifications)
    product.value = null
    updateProductSpecifications(newSpecifications)
    await updateProduct(id, productU)
    router.go(-1)
  }
}

const isInputText = (i: number) => {
  let value = false
  if (product.value) {
    const spec = product.value?.specifications[i].categorySpecificationsId
    if (
      typeof spec.step === 'number' &&
      typeof spec.max === 'number' &&
      typeof spec.min === 'number'
    ) {
      value = true
    }
  }
  return value
}
</script>

<template>
  <div class="root">
    <div v-if="product" class="container">
      <form class="list__form pt-10" @submit.prevent="save">
        <div
          v-for="(specification, i) in product.specifications"
          :key="specification.categorySpecificationsId.id"
        >
          <label>
            {{ specification.categorySpecificationsId.title }}
          </label>
          <template v-if="specification.categorySpecificationsId.type">
            <InputText
              v-if="isInputText(i)"
              v-model="specification.value"
              :step="specification.categorySpecificationsId.step!"
              :min="specification.categorySpecificationsId.min!"
              :max="specification.categorySpecificationsId.max!"
              type="number"
            />
          </template>
          <template v-else>
            <br />
            <select v-model="specification.value" required class="mt-4">
              <option value="" selected disabled hidden>
                выберите значение
              </option>
              <option
                v-for="value in specification.categorySpecificationsId
                  .variantsValues"
                :key="value"
                :value="value"
              >
                {{ value }}
              </option>
            </select>
          </template>
        </div>
        <div>
          <label>наименование</label>
          <InputText v-model.trim="product.name" />
        </div>
        <div>
          <label>описание</label>
          <InputText v-model.trim="product.description" />
        </div>
        <div>
          <label>скидка</label>
          <InputText v-model.number="product.discount" type="number" />
        </div>

        <div>
          <label>изображение</label>
          <InputFile
            v-model.trim="product.img"
            folder="products"
            :required="false"
          />
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
          <InputText v-model="product.warranty" type="number" />
        </div>
        <div>
          <label>цена</label>
          <InputText v-model="product.price" type="number" />
        </div>
        <div>
          <button class="btn">сохранить</button>
        </div>
      </form>
      <button class="btn mt-8" @click="$router.go(-1)">назад</button>
    </div>
    <div v-else class="h-screen flex items-center">
      <Loader />
    </div>
  </div>
</template>

<style scoped lang="sass">

.root
  background: #fff
  min-height: 100vh
  margin: 0
  padding: 0
</style>
