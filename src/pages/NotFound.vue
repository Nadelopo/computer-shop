<script setup lang="ts">
import { VButton } from '@/components/UI'
</script>

<template>
  <div class="container flex justify-center">
    <div class="">
      <h1>404</h1>
      <h2>СТРАНИЦА НЕ НАЙДЕНА</h2>
      <router-link :to="{ name: 'Home' }" class="flex justify-center mt-4">
        <v-button>ГЛАВНАЯ</v-button>
      </router-link>
    </div>
  </div>
</template>

<style scoped lang="scss">
h1 {
  font-size: 7.5em;
  margin: 15px 0px;
  font-weight: bold;
}
h2 {
  font-weight: bold;
}
</style>
