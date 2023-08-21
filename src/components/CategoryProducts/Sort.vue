<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useFilterStore } from '@/stores/filterStore'
import { VButton } from '@/components/UI'
import { ArrowSvg } from '@/assets/icons'

const route = useRoute()
const router = useRouter()

type SortType = keyof typeof sortAscents

const { sortAscents } = useFilterStore()
const { sortColumn, loading } = storeToRefs(useFilterStore())

const sort = async (type: SortType) => {
  if (loading.value === 'loading') return
  sortColumn.value = type

  sortAscents[type] = !sortAscents[type]
  router.push({
    query: {
      ...route.query,
      sort: type + '_' + sortAscents[type]
    }
  })
}

const sortData: { type: SortType; text: string }[] = [
  {
    type: 'price',
    text: 'цене'
  },
  {
    type: 'countReviews',
    text: 'отзывам'
  },
  {
    type: 'discount',
    text: 'скидке'
  },
  {
    type: 'popularity',
    text: 'популярности'
  },
  {
    type: 'rating',
    text: 'оценке'
  }
]
</script>

<template>
  <div class="sort">
    <div class="font-medium">соритровка по:</div>
    <v-button
      v-for="(item, i) in sortData"
      :key="i"
      :min-width="i === 0 ? 'auto' : undefined"
      @click="sort(item.type)"
    >
      <span class="mr-3">{{ item.text }}</span>
      <arrow-svg :class="sortAscents[item.type] === false && 'down'" />
    </v-button>
  </div>
</template>

<style scoped lang="sass">
.sort
  display: flex
  gap: 16px
  margin-top: 32px
  align-items: center
  svg
    fill: var(--bright)
    transition: .2s
    &.down
      transform: rotate(180deg)
</style>
