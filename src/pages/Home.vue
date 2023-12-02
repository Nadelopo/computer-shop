<script setup lang="ts">
import Categories from '@/components/Home/Categories.vue'
import Manufacturers from '@/components/Home/Manufacturers.vue'
import PopularProducts from '@/components/Home/PopularProducts.vue'
import RecentlyProducts from '@/components/Home/RecentlyProducts.vue'
</script>

<template>
  <div class="container flex flex-col gap-14">
    <Categories />
    <Manufacturers />
    <popular-products />
    <recently-products />
  </div>
</template>
