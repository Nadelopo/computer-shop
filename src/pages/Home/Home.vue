<script setup lang="ts">
import CategoriesList from './components/CategoriesList.vue'
import ManufacturersList from './components/ManufacturersList.vue'
import PopularProducts from './components/PopularProducts.vue'
import RecentlyProducts from '@/pages/Home/components/RecentlyProducts.vue'
</script>

<template>
  <div class="container flex flex-col gap-14">
    <CategoriesList />
    <ManufacturersList />
    <PopularProducts />
    <RecentlyProducts />
  </div>
</template>
