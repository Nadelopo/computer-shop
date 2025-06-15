<script setup lang="ts">
import { computed, onBeforeMount, onUnmounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCartStore, getWordByQuantity, type ProductCart } from '@/modules/cart'
import { formatPrice } from '@/shared/utils/formatPrice'
import { useLocalStorage } from '@/shared/composables/localStorage'
import { VLoader, VButton, VModal } from '@/shared/components/UI'
import ProductsWithChangedPrice from '@/pages/Cart/components/ProductsWithChangedPrice.vue'
import CartItemCard from '@/pages/Cart/components/CartItemCard.vue'
import AppLink from '@/shared/components/AppLink.vue'
import type { Loading } from '@/shared/types'

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
    return a + b.price * b.count + b.servicePrice * b.count
  }, 0)
})

onUnmounted(() => {
  cartItemsWithDetails.value = []
})
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
      <div>В корзине нет товаров</div>
      <div>Посмотрите предложения на главной странице</div>
      <div class="flex justify-center mt-2 text-base font-normal">
        <VButton>
          <AppLink :to="{ name: 'Home' }"> Вернуться к покупкам </AppLink>
        </VButton>
      </div>
    </div>
    <div
      v-else-if="loading === 'success'"
      class="cart"
    >
      <div>
        <CartItemCard
          v-for="product in cartItemsWithDetails"
          :key="product.id"
          v-model="product.additionalWarranty"
          :product="product"
        />
      </div>
      <div>
        <div class="bg-white rounded p-3">
          <div class="">Итого:</div>
          <div class="flex justify-between font-medium text-lg mb-2">
            <div>
              {{ countCartItems }}
              {{ getWordByQuantity(countCartItems) }}
            </div>
            <div>
              {{ formatPrice(sumPrice) }}
            </div>
          </div>
          <AppLink :to="{ name: 'Checkout' }">
            <VButton width="100%"> Перейти к оформлению </VButton>
          </AppLink>
        </div>
      </div>
      <VModal
        v-model="showModal"
        class="p-4"
      >
        <ProductsWithChangedPrice
          :products="changedProducts"
          @close="showModal = false"
        />
      </VModal>
    </div>
    <div
      v-else-if="loading === 'loading'"
      class="h-screen flex items-center"
    >
      <VLoader />
    </div>
    <div v-else-if="loading === 'error'">ошибка</div>
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
