<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCategoriesStore } from '@/stores/categoriesStore'

const { categories } = storeToRefs(useCategoriesStore())
</script>

<template>
  <div class="grid">
    <router-link
      v-for="category in categories"
      :key="category.id"
      :to="{ name: 'EditCategory', params: { categoryId: category.id } }"
      class="wrapper"
      title="нажмите для изменения"
    >
      <div class="text-xl font-bold">{{ category.title }}</div>
      <div>
        <img :src="category.img" alt="img" />
      </div>
    </router-link>
  </div>
</template>

<style scoped lang="sass">
.grid
  margin-top: 20px
  display: grid
  grid-template-columns: repeat(4, 1fr)
  justify-items: center
  gap: 100px

.wrapper
  cursor: pointer
  background: #fff
  padding: 20px 20px
  width: 100%
  display: flex
  justify-content: center
  flex-direction: column
  justify-content: space-between
  div
    align-self: center
    transition: .3s
    img
      max-height: 150px
  &:hover div
    color: var(--color-text)
</style>
