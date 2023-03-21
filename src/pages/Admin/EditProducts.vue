<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useProductsStore } from '@/stores/productsStore'
import { useManufacturersStore } from '@/stores/manufacturersStore'
import { getAllByColumn, getOneWithId } from '@/utils/dbQueries'
import VInputText from '@/components/UI/VInputText.vue'
import VInputFile from '@/components/UI/VInputFile.vue'
import VButton from '@/components/UI/VButton.vue'
import VSelect from '@/components/UI/VSelect.vue'
import VLoader from '@/components/UI/Vloader.vue'
import VDoubleButtons from '@/components/UI/VDoubleButtons.vue'
import type {
  IproductR,
  IproductSpecificationU,
  IproductU
} from '@/types/tables'
import { removeFromStorage } from '@/utils/queries/storage'

interface IproductSpecificationOnEdit {
  id: number
  categorySpecificationsId: {
    id: number
    title: string
    type: boolean
    visible: boolean
    units: string
    step: number | null
    min: number | null
    max: number | null
    variantsValues: string[] | null
  }
  productId: number
  value: string
}

interface IproductWithSpecificationsOnEdit extends IproductR {
  specifications: IproductSpecificationOnEdit[]
}

const { updateProduct, updateProductSpecifications } = useProductsStore()
const { manufacturers } = storeToRefs(useManufacturersStore())

const router = useRouter()
const route = useRoute()

const id = Number(route.params.id)
const categoryId = Number(route.params.categoryId)
const categoryTitle = route.params.category

const product = ref<IproductWithSpecificationsOnEdit | null>(null)
const img = ref('')
const manufacturerSelect = ref(0)
const loader = ref<'loading' | 'success'>('loading')

const { data } = await getOneWithId<IproductR>(
  'products',
  id,
  '*, manufacturerId(id, title)'
)
const spec = await getAllByColumn<IproductSpecificationOnEdit>(
  'specifications',
  'productId',
  id,
  'id, value, productId, categorySpecificationsId(id, title,  visible, units, type, step, min, max, variantsValues)',
  'categorySpecificationsId'
)
if (data && spec.data) {
  img.value = data.img
  manufacturerSelect.value = data.manufacturerId.id
  product.value = { ...data, specifications: spec.data }
  loader.value = 'success'
}

const getImgName = (url: string) => url.split('/').reverse()[0]

const save = async () => {
  if (product.value) {
    loader.value = 'loading'
    const imgName = getImgName(img.value)
    if (imgName !== getImgName(product.value.img)) {
      await removeFromStorage('products', imgName)
    }
    const productU: IproductU = {
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

    const newSpecifications: IproductSpecificationU[] =
      product.value.specifications.map((spec) => {
        return { id: spec.id, value: spec.value }
      })

    product.value = null
    updateProductSpecifications(newSpecifications)
    await updateProduct(id, productU)
    router.push({
      name: 'AdminProducts',
      params: { category: categoryTitle, id: categoryId }
    })
  }
}

const specificationsVariantsValues = (i: number) => {
  let arr: { value: string; title: string }[] = []
  const varinsValues =
    product.value?.specifications[i].categorySpecificationsId.variantsValues
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
  loader.value = 'loading'
  if (product.value) {
    const imgName = getImgName(img.value)
    if (imgName !== getImgName(product.value.img)) {
      await removeFromStorage('products', getImgName(product.value.img))
    }
  }
  router.push({
    name: 'AdminProducts',
    params: { category: categoryTitle, id: categoryId }
  })
}
</script>

<template>
  <div class="root">
    <div v-if="product && loader === 'success'" class="container">
      <form class="list__form pt-10" @submit.prevent="save">
        <div
          v-for="(specification, i) in product.specifications"
          :key="specification.categorySpecificationsId.id"
        >
          <label>
            {{ specification.categorySpecificationsId.title }}
          </label>
          <template v-if="specification.categorySpecificationsId.type">
            <v-input-text
              v-model="specification.value"
              :step="Number(specification.categorySpecificationsId.step)"
              :min="Number(specification.categorySpecificationsId.min)"
              :max="Number(specification.categorySpecificationsId.max)"
              type="number"
            />
          </template>
          <template v-else>
            <div>
              <v-select
                v-model="specification.value"
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
          <v-input-text v-model.number="product.discount" type="number" />
        </div>

        <div>
          <label>изображение</label>
          <v-input-file
            v-model.trim="product.img"
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
            type="button"
            text-first="продавать"
            text-second="остановить продажи"
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
        <div>
          <v-button>сохранить</v-button>
        </div>
      </form>
      <v-button class="mt-8" @click="back"> назад </v-button>
    </div>
    <div v-else class="h-screen flex items-center">
      <v-loader />
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
