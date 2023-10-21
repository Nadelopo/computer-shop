<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useProductsStore } from '@/stores/productsStore'
import { useManufacturersStore } from '@/stores/manufacturersStore'
import { getAll, getOneById } from '@/db/queries/tables'
import type { CategorySpecificationRead } from '@/types/tables/categorySpecifications.types'
import type { Loading } from '@/types'
import {
  VButton,
  VLoader,
  VInputText,
  VInputFile,
  VSelect,
  VDoubleButtons
} from '@/components/UI'
import type {
  SpecificationRead,
  SpecificationUpdate
} from '@/types/tables/specifications.types'
import type {
  ProductReadWithDetails,
  ProductUpdate
} from '@/types/tables/products.types'
import type { InputFileActions } from '@/components/UI/VInputFile/types'

type ProductSpecificationOnEdit = SpecificationRead & {
  category_specifications: Omit<
    CategorySpecificationRead,
    'created_at' | 'categoryId' | 'enTitle'
  >
}

type ProductWithSpecificationsOnEdit = ProductReadWithDetails & {
  specifications: ProductSpecificationOnEdit[]
}

type SpecificationUpdateMany = SpecificationUpdate &
  Required<Pick<SpecificationUpdate, 'id'>>

const router = useRouter()
const route = useRoute()

const { updateProduct, updateProductSpecifications } = useProductsStore()
const { manufacturers } = storeToRefs(useManufacturersStore())

const id = Number(route.params.id)
const categoryId = Number(route.params.categoryId)
const categoryTitle = route.params.category

const product = ref<ProductWithSpecificationsOnEdit | null>(null)
const img = ref<string[]>([])
const manufacturerSelect = ref(0)
const loading = ref<Loading>('loading')

onBeforeMount(async () => {
  const [
    { data: productData, error: errorData },
    { data: specifications, error: errorSpecifications }
  ] = await Promise.all([
    getOneById(
      'products',
      id,
      '*, manufacturers(id, title), categories(id, enTitle)'
    ),
    getAll('specifications', {
      match: { productId: id },
      select:
        '*, category_specifications(id, title, visible, units, type, step, min, max, variantsValues)',
      order: ['categorySpecificationsId']
    })
  ])

  if (errorData || errorSpecifications) {
    loading.value = 'error'
    return
  }

  if (productData && specifications) {
    img.value = productData.img
    manufacturerSelect.value = productData.manufacturers.id
    product.value = { ...productData, specifications }
    loading.value = 'success'
  }
})

const inputFileRef = ref<InputFileActions<string[]>>()
const save = async () => {
  if (product.value) {
    loading.value = 'loading'
    const { url, error: errorImage } =
      (await inputFileRef.value?.onSave()) || {}
    if (errorImage) {
      loading.value = 'error'
    }
    if (url) {
      product.value.img = url
    }

    const productU: ProductUpdate = {
      name: product.value.name,
      description: product.value.description,
      img: product.value.img,
      manufacturerId: manufacturerSelect.value,
      warranty: product.value.warranty,
      price: product.value.price,
      discount: product.value.discount,
      quantity: product.value.quantity,
      sell: product.value.sell
    }

    const newSpecifications: SpecificationUpdateMany[] =
      product.value.specifications.map((spec) => {
        return {
          id: spec.id,
          valueNumber: spec.valueNumber,
          valueString: spec.valueString
        }
      })

    product.value = null
    const response = await Promise.all([
      updateProductSpecifications(newSpecifications),
      updateProduct(id, productU)
    ])

    const error = response.some((e) => e === null)
    if (error) {
      loading.value = 'error'
      return
    }

    router.push({
      name: 'AdminProducts',
      params: { category: categoryTitle, id: categoryId }
    })
  }
}

const specificationsVariantsValues = (i: number) => {
  let arr: { value: string; title: string }[] = []
  const varinsValues =
    product.value?.specifications[i].category_specifications.variantsValues
  if (varinsValues) {
    arr = varinsValues.map((e) => ({
      value: e,
      title: e
    }))
  }
  return arr
}

const manufacturersSelect = computed(() => {
  let arr = []
  arr = manufacturers.value.map((e) => ({ value: e.id, title: e.title }))
  return arr
})

const back = async () => {
  loading.value = 'loading'

  router.push({
    name: 'AdminProducts',
    params: { category: categoryTitle, id: categoryId }
  })
}
</script>

<template>
  <div class="root">
    <div
      v-if="product && loading === 'success'"
      class="container"
    >
      <form
        class="list__form pt-10"
        @submit.prevent="save"
      >
        <div
          v-for="(specification, i) in product.specifications"
          :key="specification.category_specifications.id"
        >
          <label>
            {{ specification.category_specifications.title }}
          </label>
          <template v-if="specification.category_specifications.type">
            <v-input-text
              v-model="specification.valueNumber"
              :step="Number(specification.category_specifications.step)"
              :min="Number(specification.category_specifications.min)"
              :max="Number(specification.category_specifications.max)"
              type="number"
            />
          </template>
          <template v-else>
            <div>
              <v-select
                v-model="specification.valueString"
                :options="specificationsVariantsValues(i)"
              />
            </div>
          </template>
        </div>
        <div>
          <label>наименование</label>
          <v-input-text v-model.trim="product.name" />
        </div>
        <div>
          <label>описание</label>
          <v-input-text v-model.trim="product.description" />
        </div>
        <div>
          <label>скидка</label>
          <v-input-text
            v-model.number="product.discount"
            type="number"
            min="0"
            max="100"
          />
        </div>

        <div>
          <label>изображение</label>
          <v-input-file
            :file-url="product.img"
            folder="products"
            :required="false"
          />
        </div>

        <div>
          <label>производитель</label>
          <div>
            <v-select
              v-model="manufacturerSelect"
              :options="manufacturersSelect"
            />
          </div>
        </div>
        <div>
          <label>продажи</label>
          <v-double-buttons
            v-model="product.sell"
            text-first="продавать"
            text-second="остановить продажи"
          />
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
        <div>
          <v-button>сохранить</v-button>
        </div>
      </form>
      <v-button
        class="mt-6"
        @click="back"
      >
        назад
      </v-button>
    </div>
    <div
      v-else
      class="h-screen flex items-center"
    >
      <v-loader />
    </div>
  </div>
</template>

<style scoped lang="sass">
.root
  background: #fff
  min-height: 100vh
  margin: 0
  padding: 50px 0
</style>
