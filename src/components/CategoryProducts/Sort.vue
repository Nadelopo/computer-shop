<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useFilterStore } from '@/stores/filterStore'
import { VButton } from '@/components/UI'
import ArrowSVG from '@/assets/icons/arrow.svg?component'

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
</script>

<template>
  <div class="sort">
    <div class="font-medium">соритровка по:</div>
    <v-button min-width="auto" @click="sort('price')">
      <span class="mr-3">цене</span>
      <ArrowSVG :class="!sortAscents.price && 'down'" />
    </v-button>
    <v-button @click="sort('countReviews')">
      <span class="mr-3">отзывам</span>
      <ArrowSVG :class="!sortAscents.countReviews && 'down'" />
    </v-button>
    <v-button @click="sort('discount')">
      <span class="mr-3"> скидке</span>
      <ArrowSVG :class="!sortAscents.discount && 'down'" />
    </v-button>
    <v-button @click="sort('popularity')">
      <span class="mr-3"> популярности</span>
      <ArrowSVG :class="!sortAscents.popularity && 'down'" />
    </v-button>
    <v-button @click="sort('rating')">
      <span class="mr-3"> оценке</span>
      <ArrowSVG :class="!sortAscents.rating && 'down'" />
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
