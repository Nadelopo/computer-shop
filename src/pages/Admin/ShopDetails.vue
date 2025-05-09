<script setup lang="ts">
import { ref } from 'vue'
import ShopDetailsList from '@/components/Admin/ShopDetails/ShopDetailsList.vue'
import ProductAddition from '@/components/Admin/ShopDetails/ProductAddition.vue'

const shopDetailsListActions = ref<{ loadProductsInShops: () => void }>()
</script>

<template>
  <div class="flex flex-col gap-4">
    <ProductAddition
      @load-products="shopDetailsListActions?.loadProductsInShops"
    />
    <ShopDetailsList ref="shopDetailsListActions" />
  </div>
</template>

<style scoped lang="sass"></style>
