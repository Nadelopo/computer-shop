<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { supabase } from '@/db/supabase'
import { useCustomRoute, useCustomRouter } from '@/utils/customRouter'
import ProductsForm from '@/components/Admin/Products/ProductsForm.vue'
import { VButton, VLoader } from '@/components/UI'
import type { Loading } from '@/types'
import type { SpecificationCreate } from '@/types/tables/specifications.types'
import type {
  ProductCreate,
  ProductUpdate
} from '@/types/tables/products.types'
import type { InputFileActions } from '@/components/UI/VInputFile/types'
import type { SpecificationUpdateForm } from '@/components/Admin/Products/types'
// import type { UpdateMany } from '@/db/queries/types'

type SpecificationUpdateMany = SpecificationCreate &
  Required<Pick<SpecificationCreate, 'id'>>

const route = useCustomRoute('EditProducts')
const productId = Number(route.params.id)
const product = ref<ProductCreate | null>(null)
const specifications = ref<SpecificationUpdateForm[]>([])
const loading = ref<Loading>('loading')

onBeforeMount(async () => {
  const { data, error } = await supabase
    .from('products')
    .select(
      '*, manufacturers(id, title), categories(id, enTitle), specifications(*, category_specifications(id, title, visible, units, type, step, min, max, variantsValues))'
    )
    .eq('id', productId)
    .order('categorySpecificationsId', { referencedTable: 'specifications' })
    .single()
  if (error) {
    loading.value = 'error'
    return
  }

  const { specifications: specificationsValue, ...productValue } = data
  product.value = productValue
  specifications.value = specificationsValue.map((s) => {
    const staticFields = {
      id: s.id,
      productId,
      categorySpecificationsId: s.categorySpecificationsId,
      title: s.category_specifications.title
    }
    if (s.category_specifications.type === 'number') {
      const { max, min, step } = s.category_specifications
      return {
        ...staticFields,
        type: 'number',
        valueNumber: s.valueNumber!,
        valueString: null,
        max: max!,
        min: min!,
        step: step!
      }
    }
    return {
      ...staticFields,
      valueNumber: null,
      type: s.category_specifications.type,
      valueString: s.valueString!,
      variantsValues: s.category_specifications.variantsValues!,
      min: null,
      max: null,
      step: null
    }
  })
  loading.value = 'success'
})

const router = useCustomRouter()
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

async function updateProductSpecifications(
  updatedSpecifications: SpecificationCreate[]
) {
  const { data: newSpecifications } = await supabase
    .from('specifications')
    .upsert(updatedSpecifications, {
      onConflict: 'id'
    })
    .select()

  return newSpecifications?.sort(
    (a, b) => a.categorySpecificationsId - b.categorySpecificationsId
  )
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
    title: productValue.title,
    description: productValue.description,
    img: productValue.img,
    manufacturerId: productValue.manufacturerId,
    warranty: productValue.warranty,
    price,
    priceWithoutDiscount: productValue.priceWithoutDiscount,
    discount: productValue.discount,
    sell: productValue.sell
  }
  const newSpecifications: SpecificationUpdateMany[] = specifications.value
    .filter((e) => e.productId !== undefined)
    .map(
      (e): SpecificationUpdateMany => ({
        id: e.id,
        valueNumber: e.valueNumber,
        valueString: e.valueString,
        categorySpecificationsId: e.categorySpecificationsId,
        productId: e.productId as number
      })
    )

  product.value = null
  const response = await Promise.all([
    updateProductSpecifications(newSpecifications),
    supabase.from('products').update(productUpdate).eq('id', productId)
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
