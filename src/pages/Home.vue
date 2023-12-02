<script setup lang="ts">
import Categories from '@/components/Home/Categories.vue'
import Manufacturers from '@/components/Home/Manufacturers.vue'
import PopularProducts from '@/components/Home/PopularProducts.vue'
</script>

<template>
  <div class="container">
    <Categories />
    <Manufacturers />
    <popular-products />
  </div>
</template>
