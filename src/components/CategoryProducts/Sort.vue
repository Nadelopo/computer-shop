<script setup lang="ts">
import { useProductsStore } from '@/stores/productsStore'
import { useRoute } from 'vue-router'
import VButton from '../UI/VButton.vue'

const { setProducts } = useProductsStore()

const categoryId = Number(useRoute().params.id)

const sort = async () => {
  setProducts(categoryId, undefined, 'price')
}
</script>

<template>
  <div>
    <div>соритровкаа цены по:</div>
    <div>
      <v-button @click="sort">возрастанию</v-button>
    </div>
  </div>
</template>
