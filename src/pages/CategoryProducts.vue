<script setup lang="ts">
import { useProductsStore } from '@/stores/productsStore'
import ProductBlock from '@/components/CategoryProducts/ProductBlock.vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import Search from '@/components/CategoryProducts/Search.vue'

const { products, categoryId } = storeToRefs(useProductsStore())
const { getProducts } = useProductsStore()

categoryId.value = Number(useRoute().params.id)

if (!products.value.length) {
  getProducts(categoryId.value)
} else if (products.value[0].categoryId !== categoryId.value) {
  products.value = []
  getProducts(categoryId.value)
}
</script>

<template>
  <div class="container">
    <div class="grid">
      <div />
      <div>
        <Search />
        <div class="product__list">
          <template v-for="product in products" :key="product.id">
            <ProductBlock :item="product" />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="sass">
.grid
  display: grid
  grid-template-columns: 20% 1fr
  gap: 20px

.product__list
  margin-top: 20px
  display: flex
  flex-direction: column
  gap: 30px
</style>
