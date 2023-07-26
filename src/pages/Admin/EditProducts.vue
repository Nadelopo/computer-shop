<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { getAll, getOneById } from '@/utils/queries/db'
import { getImgName } from '@/utils/getImgName'
import { removeFromStorage } from '@/utils/queries/storage'
import { useProductsStore } from '@/stores/productsStore'
import { useManufacturersStore } from '@/stores/manufacturersStore'
import VInputText from '@/components/UI/VInputText.vue'
import VInputFile from '@/components/UI/VInputFile.vue'
import VButton from '@/components/UI/VButton.vue'
import VSelect from '@/components/UI/VSelect.vue'
import VLoader from '@/components/UI/VLoader.vue'
import VDoubleButtons from '@/components/UI/VDoubleButtons.vue'
import type {
  SpecificationRead,
  SpecificationUpdate
} from '@/types/tables/specifications.types'
import type {
  ProductReadWithDetails,
  ProductUpdate
} from '@/types/tables/products.types'
import type { CategorySpecificationRead } from '@/types/tables/categorySpecifications.types'

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
const img = ref('')
const manufacturerSelect = ref(0)
const loading = ref<'loading' | 'success'>('loading')

onBeforeMount(async () => {
  const productData = await getOneById<ProductReadWithDetails>('products', id, {
    select: '*, manufacturers(id, title), categories(id, enTitle)'
  })
  const { data: specifications } = await getAll<ProductSpecificationOnEdit>(
    'specifications',
    {
      eq: [['productId', id]],
      select:
        '*, category_specifications(id, title, visible, units, type, step, min, max, variantsValues)',
      order: {
        value: 'categorySpecificationsId'
      }
    }
  )
  if (productData && specifications) {
    img.value = productData.img
    manufacturerSelect.value = productData.manufacturers.id
    product.value = { ...productData, specifications }
    loading.value = 'success'
  }
})

const save = async () => {
  if (product.value) {
    loading.value = 'loading'
    const imgName = getImgName(img.value)
    if (imgName !== getImgName(product.value.img)) {
      await removeFromStorage('products', imgName)
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
    await updateProductSpecifications(newSpecifications)
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
    <div v-if="product && loading === 'success'" class="container">
      <form class="list__form pt-10" @submit.prevent="save">
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
      <v-button class="mt-6" @click="back"> назад </v-button>
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
  padding: 50px 0
</style>
