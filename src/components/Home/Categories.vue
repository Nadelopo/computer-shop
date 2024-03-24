<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCategoriesStore } from '@/stores/categoriesStore'
import AppLink from '../AppLink.vue'

const { categories } = storeToRefs(useCategoriesStore())
</script>

<template>
  <div class="grid">
    <template v-if="categories.length">
      <div
        v-for="category in categories"
        :key="category.id"
      >
        <app-link
          class="link__wrap"
          :to="{
            name: 'CategoryProducts',
            params: { category: category.enTitle, id: category.id }
          }"
        >
          <div class="wrap">
            <img
              :src="category.img"
              alt=""
              class="mx-auto mb-auto"
            />

            <div class="text-center text">{{ category.title }}</div>
          </div>
        </app-link>
      </div>
    </template>
    <template v-else>
      <div
        v-for="i in 8"
        :key="i"
        class="link__wrap"
      />
    </template>
  </div>
</template>

<style scoped lang="sass">
.link__wrap
  width: 100%
  height: 220px
  background-color: #fff
  border-radius: 8px
  box-shadow: 0 1px 10px 0 rgb(0 0 0 / 26%)
  vertical-align: middle
  display: inline-grid
  align-content: center
  cursor: pointer

.text
  font-weight: 600
  font-size: 20px
  transition: .2s
  .link__wrap:hover &
    color: var(--color-text)

.grid
  display: grid
  grid-template-columns: repeat(4, 1fr)
  gap: 40px
  @media (width < 1024px)
    grid-template-columns: 1fr 1fr
  @media (width < 700px)
    grid-template-columns: 1fr

.wrap
  padding: 20px 10px
  display: flex
  flex-direction: column
  justify-content: center
  align-items: center
  height: inherit
</style>
