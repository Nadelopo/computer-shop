<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue'
import { getAll } from '@/db/queries/tables'
import { getCurrentTime } from '@/utils/getCurrentTime'
import { ArrowSvg } from '@/assets/icons'
import type { Loading } from '@/types'

const formatDate = (date: Date): string => {
  return String(date.toLocaleDateString()).split('.').reverse().join('-')
}

const currentMothCount = ref(0)
const previousMothCount = ref(0)

const loading = ref<Loading>('loading')
onBeforeMount(async () => {
  const time = await getCurrentTime()
  const currentDate = time ? new Date(time) : new Date()
  const monthAgo = new Date(currentDate.setDate(currentDate.getDate() - 30))
  const twoMothsAgo = new Date(currentDate.setDate(monthAgo.getDate() - 30))

  const results = await Promise.all([
    getAll('orders', {
      gte: ['created_at', formatDate(monthAgo)]
    }),
    getAll('orders', {
      onlyCount: true,
      gte: ['created_at', formatDate(twoMothsAgo)],
      lte: ['created_at', formatDate(monthAgo)]
    })
  ])
  currentMothCount.value = results[0].count ?? 0
  previousMothCount.value = results[1].count ?? 0
  loading.value = 'success'
})

const differentPreviousCount = computed(() => {
  const increase = currentMothCount.value - previousMothCount.value
  const percentageIncrease = (increase / previousMothCount.value) * 100
  return Number(percentageIncrease.toFixed(2))
})

const text = computed(() => {
  if (differentPreviousCount.value === Infinity) {
    return 'В прошлом месяце не было продаж'
  }
  if (differentPreviousCount.value === 0) {
    return 'В этом месяце не бло продаж'
  }
  return `${differentPreviousCount.value} %`
})
</script>

<template>
  <div>
    <div class="wrapper">
      <div class="wrapper__left">
        <div
          v-if="loading === 'success'"
          class="orders"
        >
          <div> Заказы за месяц </div>
          <div>{{ currentMothCount }}</div>
          <div
            class="comparison"
            :class="[differentPreviousCount < 0 && 'negative']"
          >
            <arrow-svg />
            <div>{{ text }} </div>
          </div>
        </div>
      </div>
    </div>
    <div></div>
  </div>
</template>

<style scoped lang="sass">
.wrapper
  display: grid
  grid-template-columns: 1fr 1fr
  gap: 20px
  &__left
    display: grid
    grid-template-columns: 1fr 1fr
    gap: 20px

.orders
  border-radius: 4px
  background: #fff
  padding: 20px
  .comparison
    display: flex
    gap: 8px
    color: var(--main-semi-light)
    svg
      fill: var(--main)
    &.negative
      color: var(--danger)
      svg
        fill: var(--danger)
        transform: rotate(-180deg)
</style>
