<script setup lang="ts">
import { ref } from 'vue'
import VModal from '../UI/VModal.vue'
import type { ShopWithProduct } from './Header.vue'

defineProps<{
  shops: ShopWithProduct[]
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
      class="p-4"
    >
      <div
        v-for="shop in shops"
        :key="shop.id"
      >
        {{ shop.shops.address }}
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
</style>
