<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useProductsStore } from '@/stores/productsStore'
import ProductBlock from '@/components/CategoryProducts/ProductBlock.vue'
import type { IproductWithSpecifications } from '@/stores/productsStore/types'

const { getProductsCard } = useProductsStore()

const products = ref<IproductWithSpecifications[]>([])

onMounted(async () => {
  const data = await getProductsCard(Number(useRoute().params.id))
  products.value = data.products.value
})
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
