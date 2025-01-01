<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMediaQuery } from '@vueuse/core'
import { supabase } from '@/db/supabase'
import { useUserStore } from '@/stores/userStore'
import {
  useCartStore,
  type ProductStorage,
  type ProductCart
} from '@/stores/cartStore'
import { formatPrice } from '@/utils/formatPrice'
import { useLocalStorage } from '@/utils/localStorage'
import { VButtons, VSelect } from '../UI'
import ItemActions from './ItemActions.vue'
import AppLink from '../AppLink.vue'
import type { Loading } from '@/types'

defineProps<{
  product: ProductCart
}>()

const additionalWarranty = defineModel<number>({ required: true })

const { isUserAuthenticated } = useUserStore()
const { getMarkup } = useCartStore()
const { cartItems } = storeToRefs(useCartStore())

const cartItemsStorage = useLocalStorage<ProductStorage[]>('cart')
const loadingServicePrice = ref<Loading>('success')

const setServicePrice = async (warranty: number, product: ProductCart) => {
  loadingServicePrice.value = 'loading'
  const user = await isUserAuthenticated()
  if (user && product.cartItemId) {
    const { error } = await supabase
      .from('cart')
      .update({ additionalWarranty: warranty })
      .eq('id', product.cartItemId)
    if (error) {
      loadingServicePrice.value = 'error'
      return
    }
  } else {
    cartItemsStorage.set(
      cartItems.value.map((e) =>
        e.productId === product.id ? { ...e, additionalWarranty: warranty } : e
      )
    )
  }
  product.servicePrice = getMarkup(warranty, product.price)
  loadingServicePrice.value = 'success'
}

const warrantyOptions = [
  { title: 'нет', value: 0 },
  { title: '+12 мес.', value: 12 },
  { title: '+24 мес.', value: 24 },
  { title: '+36 мес.', value: 36 }
]

const isMobile = useMediaQuery('(width < 640px)')
</script>

<template>
  <div class="product__wrapper">
    <div class="img">
      <app-link
        :to="{
          name: 'Product',
          params: {
            productId: product.id,
            categoryId: product.categoryId,
            category: product.categories.enTitle
          }
        }"
      >
        <img
          :src="product.img[0]"
          alt="..."
          class="max-h-24 max-w-[100px] cursor-pointer"
        />
      </app-link>
    </div>
    <div class="title">
      <app-link
        class="text-base sm:text-xl text-black font-medium duration-200 cursor-pointer hover:text-text"
        :to="{
          name: 'Product',
          params: {
            productId: product.id,
            categoryId: product.categoryId,
            category: product.categories.enTitle
          }
        }"
      >
        {{ product.title }}
      </app-link>
    </div>
    <div class="price">{{ formatPrice(product.price) }}</div>
    <item-actions
      :product-count="product.count"
      :product="product"
    />
    <div
      v-if="product.warranty <= 48"
      class="warranty"
    >
      Дополнительная гарантия
      <v-select
        v-if="isMobile"
        v-model="additionalWarranty"
        :options="warrantyOptions"
        class="mt-2"
        @update:model-value="setServicePrice($event, product)"
      />
      <v-buttons
        v-else
        v-model="additionalWarranty"
        :options="warrantyOptions"
        :loading="loadingServicePrice === 'loading'"
        class="mt-2"
        @update:model-value="setServicePrice($event, product)"
      />
    </div>
  </div>
</template>

<style scoped lang="sass">
.product__wrapper
  background: #fff
  min-height: 136px
  box-shadow: 0px 0px 10px 4px rgba(0,0,0, 0.1 )
  border-radius: 8px
  display: grid
  grid-template-columns: auto 1fr auto auto auto
  grid-template-areas: 'img title price actions .'  'img warranty warranty warranty warranty'
  gap: 0 20px
  transition: .3s
  padding: 20px
  margin-bottom: 30px
  img
    grid-area: img
  .warranty
    grid-area: warranty
  .price
    grid-area: price
  :deep(.actions)
    grid-area: actions
  .title
    grid-area: title
  &:hover
      box-shadow: rgb(0, 0, 0 , .25) 0px 0px 15px 5px
  @media (width < 640px)
    gap: 10px 20px
    grid-template-areas: 'img title title title .' 'actions price price price price' 'warranty warranty warranty warranty warranty '
</style>
