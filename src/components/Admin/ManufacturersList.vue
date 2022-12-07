<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useManufacturersStore } from '@/stores/manufacturersStore'

const { manufacturers } = storeToRefs(useManufacturersStore())
</script>

<template>
  <div>
    <div class="list">
      <router-link
        v-for="manufacturer in manufacturers"
        :key="manufacturer.id"
        :to="{ name: 'EditManufacturer', params: { id: manufacturer.id } }"
        class="wrapper"
      >
        <div>{{ manufacturer.title }}</div>
        <div><img :src="manufacturer.img" alt="" /></div>
      </router-link>
    </div>
  </div>
</template>

<style scoped lang="sass">

.list
  margin-top: 100px
  display: grid
  grid-template-columns: repeat(8, 1fr)
  gap: 30px
  .wrapper
    display: grid
    grid-template-rows: auto 1fr
    justify-items: center
    align-items: center
    cursor: pointer
    box-shadow: 0 0 6px 3px rgb(1,1,1,0.1)
    padding: 12px 0
    border-radius: 6px
    transition: .2s
    &:hover
      box-shadow: 0 0 10px 3px rgb(1,1,1,0.2)
</style>
