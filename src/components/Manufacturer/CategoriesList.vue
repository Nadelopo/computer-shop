<script setup lang="ts">
import CategorySkeleton from '@/components/Manufacturer/CategorySkeleton.vue'
import type { Loading } from '@/types'
import type { View } from '@/types/database.types'
import { computed } from 'vue'

const props = defineProps<{
  loading: Loading
  categories: View<'distinct_categories'>[] | undefined
}>()

const categoriesFormat = computed(() => {
  return (
    props.categories?.map((e) => ({
      ...e,
      title: e.title[0].toUpperCase() + e.title.slice(1)
    })) ?? []
  )
})
</script>

<template>
  <div class="wrapper">
    <template v-if="loading === 'success'">
      <router-link
        v-for="category in categoriesFormat"
        :key="category.id"
        :to="{
          name: 'CategoryProducts',
          params: { category: category.enTitle, id: category.id },
          query: { manufacturer: category.manufacturerId }
        }"
        class="category shadow"
      >
        <img
          :src="category.img"
          alt=""
        />
        <div> {{ category.title }} {{ category.repetitionCount }} </div>
      </router-link>
    </template>
    <template v-else-if="loading === 'loading'">
      <category-skeleton
        v-for="i in 12"
        :key="i"
      />
    </template>
  </div>
</template>

<style scoped lang="sass">
.wrapper
  display: grid
  gap: 16px
  justify-items: center
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))

.category
  width: 200px
  border-radius: 8px
  background: #fff
  padding: 8px
  display: grid
  grid-template-rows: minmax(50%,128px) auto
  justify-items: center
  gap: 2px
  transition: .2s
  &:hover
    color: var(--color-text)
  img
    max-height: 128px
</style>
