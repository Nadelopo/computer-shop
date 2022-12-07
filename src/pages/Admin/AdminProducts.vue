<script setup lang="ts">
import { onBeforeMount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useCategoriesStore } from '@/stores/categoriesStore'
import { useProductsStore } from '@/stores/productsStore'
import { useManufacturersStore } from '@/stores/manufacturersStore'
import VInputText from '@/components/UI/VInputText.vue'
import VInputFile from '@/components/UI/VInputFile.vue'
import ProdctsList from '@/components/Admin/ProductsList.vue'
import VLoader from '@/components/UI/Vloader.vue'
import VButton from '@/components/UI/VButton.vue'
import type {
  IcategorySpecificationR,
  IproductC,
  IproductSpecificationC,
} from '@/types/tables'
import VSelect from '@/components/UI/VSelect.vue'

interface IproductSpecificationForm
  extends Omit<IproductSpecificationC, 'productId'> {
  productId: number | null
}

const route = useRoute()

const { manufacturers } = storeToRefs(useManufacturersStore())
const { getCategorySpecifications } = useCategoriesStore()
const { createProduct, createSpecifications, setProducts } = useProductsStore()

const manufacturerSelect = ref<number | string>('')
const categoryId = ref<number>(Number(route.params.id))
const categorySpecifications = ref<IcategorySpecificationR[]>([])
const categoryFormSpecifications = ref<IproductSpecificationForm[]>([])

const copyForm: IproductC = {
  categoryId: categoryId.value,
  name: '',
  description: '',
  img: '',
  manufacturerId: 0,
  warranty: 0,
  price: 0,
  quantity: 100,
  discount: 0,
}

const product = ref<IproductC>({ ...copyForm })

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
    product.value.manufacturerId = cur
  }
})

const create = async () => {
  const { data } = await createProduct(product.value)
  if (data) {
    const productSpecifications = categoryFormSpecifications.value.map((e) => {
      return { ...e, productId: data.id }
    })

    createSpecifications(productSpecifications)
    product.value = { ...copyForm }
    setProducts(data.categoryId)
    categoryFormSpecifications.value = categoryFormSpecifications.value.map(
      (e) => ({
        ...e,
        value: '',
      })
    )
  }
}

const isInputText = (i: number) => {
  let value = false
  const spec = categorySpecifications.value[i]
  if (
    typeof spec.step === 'number' &&
    typeof spec.max === 'number' &&
    typeof spec.min === 'number'
  ) {
    value = true
  }
  return value
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
        <template v-if="specification.type">
          <v-input-text
            v-if="isInputText(i)"
            v-model="categoryFormSpecifications[i].value"
            type="number"
            :step="specification.step!"
            :min="specification.min!"
            :max="specification.max!"
          />
        </template>
        <template v-else-if="specification.variantsValues">
          <br />
          <v-select
            v-model="categoryFormSpecifications[i].value"
            :options="
              specification.variantsValues.map((e) => ({ title: e, value: e }))
            "
            classes="mt-4"
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
          <v-select
            v-model="manufacturerSelect"
            :options="
              manufacturers.map((e) => ({ value: e.id, title: e.title }))
            "
          />
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
  <v-loader v-else />
</template>
