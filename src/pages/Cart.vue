<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMediaQuery } from '@vueuse/core'
import { useCartStore } from '@/stores/cartStore'
import { VLoader, VButton, VButtons, VSelect } from '@/components/UI'
import ItemActions from '@/components/Cart/ItemActions.vue'
import { formatPrice } from '@/utils/formatPrice'
import { useChooseWord } from '@/components/Cart/useChooseWord'
import { updateOneById } from '@/db/queries/tables'
import { useUserStore } from '@/stores/userStore'
import { useLocalStorage } from '@/utils/localStorage'
import type { ProductCart, ProductInStorage } from '@/stores/cartStore'
import type { Loading } from '@/types'

const { isUserAuthenticated } = useUserStore()
const { setCartItemsWithDetails, setCartItems, getMarkup } = useCartStore()
const { cartItemsWithDetails, countCartItems, cartItems } = storeToRefs(
  useCartStore()
)
const loading = ref<Loading>('loading')
const loadData = async () => {
  loading.value = 'loading'
  const { data, error } = await setCartItems()
  if (error) {
    loading.value = 'error'
    return
  }
  if (data.length === 0) {
    loading.value = 'empty'
    return
  }
  await setCartItemsWithDetails(data)
  for (const item of cartItemsWithDetails.value) {
    item.servicePrice = getMarkup(item.additionalWarranty, item.price)
  }
  loading.value = 'success'
}

onBeforeMount(loadData)
useLocalStorage('cart', { onChange: loadData })

const sumPrice = computed(() => {
  return cartItemsWithDetails.value.reduce((a, b) => {
    return a + b.price * b.count + b.servicePrice
  }, 0)
})

const warrantyOptions = [
  { title: 'нет', value: 0 },
  { title: '+12 мес.', value: 12 },
  { title: '+24 мес.', value: 24 },
  { title: '+36 мес.', value: 36 }
]

const loadingServicePrice = ref<Loading>('success')
const cartItemsStorage = useLocalStorage<ProductInStorage[]>('cart')
const setServicePrice = async (warranty: number, product: ProductCart) => {
  loadingServicePrice.value = 'loading'
  const user = await isUserAuthenticated()
  if (user && product.cartItemId) {
    const { error } = await updateOneById('cart', product.cartItemId, {
      additionalWarranty: warranty
    })
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

const { chooseWord } = useChooseWord()

const isMobile = useMediaQuery('(width < 640px)')
</script>

<template>
  <div class="container">
    <div
      v-if="
        loading === 'empty' ||
        (loading === 'success' && cartItemsWithDetails.length === 0)
      "
      class="text-center font-medium text-xl mt-16"
    >
      <div> В корзине нет товаров </div>
      <div> Посмотрите предложения на главной странице </div>
      <div class="flex justify-center mt-2 text-base font-normal">
        <v-button>
          <router-link :to="{ name: 'Home' }">
            Вернуться к покупкам
          </router-link>
        </v-button>
      </div>
    </div>
    <div
      v-else-if="loading === 'success'"
      class="cart"
    >
      <div>
        <div
          v-for="product in cartItemsWithDetails"
          :key="product.id"
          class="product__wrapper"
        >
          <div class="img">
            <router-link
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
            </router-link>
          </div>
          <div class="title">
            <router-link
              class="text-xl text-black font-medium duration-200 cursor-pointer hover:text-text"
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
            </router-link>
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
            <template v-if="!isMobile">
              Дополнительная гарантия
              <v-buttons
                v-model="product.additionalWarranty"
                :options="warrantyOptions"
                :loading="loadingServicePrice === 'loading'"
                class="mt-2"
                @update:model-value="setServicePrice($event, product)"
              />
            </template>
            <template v-else>
              <v-select
                v-model="product.additionalWarranty"
                :options="warrantyOptions"
                @update:model-value="setServicePrice($event, product)"
              />
            </template>
          </div>
        </div>
      </div>
      <div>
        <div class="bg-white rounded p-3">
          <div class=""> Итого: </div>
          <div class="flex justify-between font-medium text-lg mb-2">
            <div>
              {{ countCartItems }}
              {{ chooseWord }}
            </div>
            <div>
              {{ formatPrice(sumPrice) }}
            </div>
          </div>
          <router-link :to="{ name: 'Checkout' }">
            <v-button width="100%"> Перейти к оформлению </v-button>
          </router-link>
        </div>
      </div>
    </div>
    <div
      v-else-if="loading === 'loading'"
      class="h-screen flex items-center"
    >
      <v-loader />
    </div>

    <div v-else-if="loading === 'error'"> ошибка </div>
  </div>
</template>

<style scoped lang="sass">
.cart
  display: grid
  grid-template-columns: 1fr 300px
  gap: 40px
  @media (width < 1024px)
    grid-template-columns: 1fr
    gap: 0

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
