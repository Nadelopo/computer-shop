<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductsStore } from '@/stores/productsStore'
import { getAll, getOneById } from '@/db/queries/tables'
import ProductsForm from '@/components/Admin/Products/ProductsForm.vue'
import { VButton, VLoader } from '@/components/UI'
import type { Loading } from '@/types'
import type { SpecificationUpdate } from '@/types/tables/specifications.types'
import type {
  ProductCreate,
  ProductUpdate
} from '@/types/tables/products.types'
import type { InputFileActions } from '@/components/UI/VInputFile/types'
import type { SpecificationUpdateForm } from '@/components/Admin/Products/types'

type SpecificationUpdateMany = SpecificationUpdate &
  Required<Pick<SpecificationUpdate, 'id'>>

const { updateProduct, updateProductSpecifications } = useProductsStore()

const route = useRoute()
const productId = Number(route.params.id)
const product = ref<ProductCreate | null>(null)
const specifications = ref<SpecificationUpdateForm[]>([])
const loading = ref<Loading>('loading')
onBeforeMount(async () => {
  const [
    { data: productData, error: errorData },
    { data: specificationsData, error: errorSpecifications }
  ] = await Promise.all([
    getOneById(
      'products',
      productId,
      '*, manufacturers(id, title), categories(id, enTitle)'
    ),
    getAll('specifications', {
      match: { productId: productId },
      select:
        '*, category_specifications(id, title, visible, units, type, step, min, max, variantsValues)',
      order: ['categorySpecificationsId']
    })
  ])
  if (!productData || !specificationsData) {
    loading.value = 'error'
    console.log(errorData, errorSpecifications)
    return
  }
  product.value = productData
  specifications.value = specificationsData.map((s) => {
    const staticFields = {
      id: s.id,
      productId,
      categorySpecificationsId: s.categorySpecificationsId,
      title: s.category_specifications.title
    }
    if (s.category_specifications.type === 'number') {
      return {
        ...staticFields,
        type: 'number',
        valueNumber: s.valueNumber!,
        valueString: null
      }
    } else {
      return {
        ...staticFields,
        valueNumber: null,
        type: s.category_specifications.type,
        valueString: s.valueString!,
        variantsValues: s.category_specifications.variantsValues!
      }
    }
  })
  loading.value = 'success'
})

const router = useRouter()
const back = async () => {
  loading.value = 'loading'
  router.push({
    name: 'AdminProducts',
    params: {
      category: route.params.category,
      id: Number(route.params.categoryId)
    }
  })
}

const save = async (fileActions: InputFileActions<string[]> | undefined) => {
  const productValue = product.value
  if (!productValue) return
  loading.value = 'loading'
  const { url, error: errorImage } = (await fileActions?.onSave()) || {}
  if (errorImage) {
    loading.value = 'error'
  }
  if (url) {
    productValue.img = url
  }

  const price = Math.round(
    productValue.discount
      ? productValue.priceWithoutDiscount -
          (productValue.priceWithoutDiscount * productValue.discount) / 100
      : productValue.priceWithoutDiscount
  )
  const productUpdate: ProductUpdate = {
    name: productValue.name,
    description: productValue.description,
    img: productValue.img,
    manufacturerId: productValue.manufacturerId,
    warranty: productValue.warranty,
    price,
    priceWithoutDiscount: productValue.priceWithoutDiscount,
    discount: productValue.discount,
    quantity: productValue.quantity,
    sell: productValue.sell
  }
  const newSpecifications: SpecificationUpdateMany[] = specifications.value.map(
    ({ id, valueNumber, valueString }) => {
      return {
        id,
        valueNumber,
        valueString
      }
    }
  )

  product.value = null
  const response = await Promise.all([
    updateProductSpecifications(newSpecifications),
    updateProduct(productId, productUpdate)
  ])

  const error = response.some((e) => e === null)
  if (error) {
    loading.value = 'error'
    return
  }

  back()
}
</script>

<template>
  <div class="root">
    <div
      v-if="product && loading === 'success'"
      class="container"
    >
      <products-form
        v-model="product"
        v-model:specifications="specifications"
        type="update"
        :loading-data="loading"
        @submit="save"
      />
      <v-button @click="back"> назад </v-button>
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
