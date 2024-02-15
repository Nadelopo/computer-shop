<script setup lang="ts">
import { onBeforeMount, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useFilterStore } from '@/stores/filterStore'
import { VButton, VSelect } from '@/components/UI'
import { ArrowSvg } from '@/assets/icons'
import { useMediaQuery } from '@vueuse/core'

const route = useRoute()
const router = useRouter()

type SortType = keyof typeof sortAscents

const { sortAscents } = useFilterStore()
const { sortColumn, loading } = storeToRefs(useFilterStore())

const setQueryParams = () => {
  router.push({
    query: {
      ...route.query,
      sort: sortColumn.value + '_' + sortAscents[sortColumn.value]
    }
  })
}

const sort = async (type: SortType) => {
  if (loading.value === 'loading') return
  sortColumn.value = type
  sortAscents[type] = !sortAscents[type]
  setQueryParams()
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

onUnmounted(() => {
  sortColumn.value = 'popularity'
  sortAscents['popularity'] = false
})

const isSmallScreen = useMediaQuery('(width < 1024px)')

const currentSort = ref(`${sortColumn.value}_${sortAscents[sortColumn.value]}`)
onBeforeMount(() => {
  const sortQuery = route.query.sort as string | undefined
  if (!sortQuery) return
  const [column, ascents] = sortQuery.split('_')
  sortColumn.value = column as SortType
  sortAscents[column as SortType] = ascents === 'true'
  currentSort.value = `${sortColumn.value}_${sortAscents[sortColumn.value]}`
})

const sortOnSmallScreen = () => {
  const [column, ascents] = currentSort.value.split('_')
  sortColumn.value = column as SortType
  sortAscents[column as SortType] = ascents === 'true'
  setQueryParams()
}
watch(currentSort, sortOnSmallScreen)

const sortOptions = [
  { title: 'популярность (возрастание)', value: 'popularity_true' },
  { title: 'популярность (убывание)', value: 'popularity_false' },
  { title: 'цена (возрастание)', value: 'price_true' },
  { title: 'цена (убывание)', value: 'price_false' },
  { title: 'оценка (возрастание)', value: 'rating_true' },
  { title: 'оценка (убывание)', value: 'rating_false' },
  { title: 'количество отзывов (возрастание)', value: 'countReviews_true' },
  { title: 'количество отзывов (убывание)', value: 'countReviews_false' },
  { title: 'скидка (возрастание)', value: 'discount_true' },
  { title: 'скидка (убывание)', value: 'discount_false' }
  // { title: 'поплуярность по возврастанию', value: 'popularity_true' },
  // { title: 'популярность по убыванию', value: 'popularity_false' },
  // { title: 'цена по возрастанию', value: 'price_true' },
  // { title: 'цена по убыванию', value: 'price_false' },
  // { title: 'оценка по возрастанию', value: 'rating_true' },
  // { title: 'оценка по убыванию', value: 'rating_false' },
  // { title: 'количество отзывов по возрастанию', value: 'countReviews_true' },
  // { title: 'количество отзывов по убыванию', value: 'countReviews_false' },
  // { title: 'скидка по возрастанию', value: 'discount_true' },
  // { title: 'скидка по убыванию', value: 'discount_false' }
]
</script>

<template>
  <div
    v-if="!isSmallScreen"
    class="sort"
  >
    <div class="font-medium hidden xl:block">соритровка по:</div>
    <v-button
      v-for="(item, i) in sortData"
      :key="i"
      width="auto"
      @click="sort(item.type)"
    >
      <span class="mr-3">{{ item.text }}</span>
      <arrow-svg
        :class="{
          down: sortAscents[item.type] === false,
          active: sortColumn === item.type
        }"
      />
    </v-button>
  </div>
  <div v-else>
    <v-select
      v-model="currentSort"
      :options="sortOptions"
      width="max"
    />
  </div>
</template>

<style scoped lang="sass">
.sort
  display: flex
  gap: 16px
  align-items: center
  svg
    transition: .2s
    &.active
      fill: var(--bright)
    &.down
      transform: rotate(180deg)
</style>
