<script setup lang="ts">
import { computed, onBeforeMount, onUnmounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCartStore } from '@/stores/cartStore'
import { formatPrice } from '@/utils/formatPrice'
import { useLocalStorage } from '@/utils/localStorage'
import { VLoader, VButton, VModal } from '@/components/UI'
import { useChooseWord } from '@/components/Cart/useChooseWord'
import ProductsWithChangedPrice from '@/components/Cart/ProductsWithChangedPrice.vue'
import ProductBlock from '@/components/Cart/ProductBlock.vue'
import type { ProductCart } from '@/stores/cartStore'
import type { Loading } from '@/types'

const { setCartItemsWithDetails, setCartItems, getMarkup } = useCartStore()
const { cartItemsWithDetails, countCartItems } = storeToRefs(useCartStore())
const showModal = ref(false)
const changedProducts = ref<ProductCart[]>([])
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
    if (item.isPriceChanged) {
      changedProducts.value.push(item)
    }
  }
  if (changedProducts.value.length) {
    showModal.value = true
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

onUnmounted(() => {
  cartItemsWithDetails.value = []
})

const { chooseWord } = useChooseWord()
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
        <product-block
          v-for="product in cartItemsWithDetails"
          :key="product.id"
          v-model="product.additionalWarranty"
          :product="product"
        />
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
      <v-modal
        v-model="showModal"
        class="p-4"
      >
        <products-with-changed-price
          :products="changedProducts"
          @close="showModal = false"
        />
      </v-modal>
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
</style>
