<script setup lang="ts">
import HomeCategoriesList from '@/modules/categories/components/HomeCategoriesList.vue'
import { HomeManufacturers } from '@/modules/manufacturers'
import PopularProducts from '@/components/Home/PopularProducts.vue'
import RecentlyProducts from '@/components/Home/RecentlyProducts.vue'
</script>

<template>
  <div class="container flex flex-col gap-14">
    <HomeCategoriesList />
    <HomeManufacturers />
    <PopularProducts />
    <RecentlyProducts />
  </div>
</template>
