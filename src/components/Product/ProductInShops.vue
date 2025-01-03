<script setup lang="ts">
import { ref } from 'vue'
import { VModal } from '../UI'
import { formatTime } from '@/utils/formatTime'
import ButtonCart from '../ButtonCart.vue'
import type { ShopWithProduct } from './Header.vue'

defineProps<{
  shops: ShopWithProduct[]
  productId: number
}>()

const isOpenModal = ref(false)
</script>

<template>
  <div>
    <div> В наличии в </div>
    <div
      class="product__inShops"
      @click="isOpenModal = true"
    >
      {{ shops.length }} магазинах
    </div>
    <v-modal
      v-model="isOpenModal"
      class="p-4 min-w-[500px]"
    >
      <div
        v-for="shop in shops"
        :key="shop.id"
        class="shop__choose"
      >
        <div class="mb-2 text-lg text-text cursor-pointer">
          {{ shop.shops.address }}
        </div>
        <div class="mb-2">
          Ежедневно c
          {{ formatTime(shop.shops.timeStart, shop.shops.timeEnd, 'до') }}
        </div>
        <div class="flex justify-between items-center">
          <ButtonCart
            :product-id
            :quantity="shop.quantity"
          />
          <div class="text-end text-main">
            доступно: {{ shop.quantity }} шт.
          </div>
        </div>
      </div>
    </v-modal>
  </div>
</template>

<style scoped lang="sass">
.product__inShops
  cursor: pointer
  color: var(--main)
  transition: .1s
  &:hover
    color: var(--main-semi-light)

.shop__choose
  padding: 16px 0
  &:not(:last-child)
    border-bottom: 1px solid var(--gray)
</style>
