<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/userStore'

const { user } = storeToRefs(useUserStore())
</script>

<template>
  <div v-if="user" class="user__info">
    <div class="row">
      <div class="">Имя</div>
      <div>{{ user.name }}</div>
    </div>
    <div class="row">
      <div class="">Почта</div>
      <div>{{ user.email }}</div>
    </div>
    <div class="row">
      <div class=""></div>
      <div>{{ user.phone }}</div>
    </div>
  </div>
</template>

<style scoped lang="sass">

.user__info
  .row
    display: grid
    grid-template-columns: 80px auto
    gap: 10px
    font-size: 20px
    font-weight: 500
</style>
