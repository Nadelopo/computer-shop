<script setup lang="ts">
import { useProductsStore } from '@/stores/productsStore'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

const { getProductsCard } = useProductsStore()

onMounted(async () => {
  const { products } = await getProductsCard(Number(useRoute().params.id))
  console.log(products)
})
</script>

<template>
  <div class="container"></div>
</template>
