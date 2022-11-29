<script setup lang="ts">
import { useProductsStore } from '@/stores/productsStore'
import ProductBlock from '@/components/CategoryProducts/ProductBlock.vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'

const { products, categoryId } = storeToRefs(useProductsStore())
const { getProductsCard } = useProductsStore()

categoryId.value = Number(useRoute().params.id)

if (!products.value.length) {
  getProductsCard(categoryId.value)
} else if (products.value[0].categoryId !== categoryId.value) {
  products.value = []
  getProductsCard(categoryId.value)
}
</script>

<template>
  <div class="container">
    <div class="grid">
      <div />
      <div>
        <template v-for="product in products" :key="product.id">
          <ProductBlock :item="product" />
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped lang="sass">
.grid
  display: grid
  grid-template-columns: 20% 1fr
  gap: 20px
</style>
