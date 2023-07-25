<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { arrayRange } from '@/utils/arrayRange'
import ArrowSVG from '@/assets/icons/arrow.svg'
import VPopup from './VPopup.vue'

type Props = {
  itemCount: number
  pageSize: number
  onClick?: () => void
}

const props = defineProps<Props>()
const modelValue = defineModel<number>({ required: true })

const router = useRouter()
const route = useRoute()

const pageCount = computed(() => {
  return Math.ceil(props.itemCount / props.pageSize)
})

// -1 = prevAction, 0 = nextAction
const items = computed(() => {
  const count = pageCount.value
  const currentPage = modelValue.value
  if (count < 5) return Array.from({ length: count }, (_, i) => i + 1)
  if (currentPage < 3) {
    return [1, 2, 3, 4, 5, 0, count]
  } else if (count - currentPage < 4) {
    return [1, -1, count - 4, count - 3, count - 2, count - 1, count]
  } else {
    return [1, -1, currentPage, currentPage + 1, currentPage + 2, 0, count]
  }
})

const otherPrefPages = computed(() => {
  const prevIndex = items.value.findIndex((i) => i === -1)
  return arrayRange(2, items.value[prevIndex + 1])
})

const otherNextPages = computed(() => {
  const nextIndex = items.value.findIndex((i) => i === 0)
  return arrayRange(
    items.value[nextIndex - 1] + 1,
    items.value[items.value.length - 1]
  )
})

const setPrev = () => {
  modelValue.value--
  props.onClick?.()
}

const setNext = () => {
  modelValue.value++
  props.onClick?.()
}

const setPage = (page: number) => {
  modelValue.value = page
  props.onClick?.()
}

watch(modelValue, () => {
  router.push({ query: { ...route.query, page: modelValue.value + 1 } })
})
</script>

<template>
  <div v-if="itemCount !== 0" class="pagination">
    <button
      v-wave="modelValue !== 0"
      :disabled="modelValue === 0"
      class="prev"
      @click="setPrev"
    >
      <ArrowSVG transform="rotate(-90)" />
    </button>
    <template v-for="(value, i) in items" :key="i">
      <button
        v-if="value > 0"
        v-wave
        :class="{ active: modelValue + 1 === value }"
        @click="setPage(value - 1)"
      >
        {{ value }}
      </button>
      <button v-else class="page-switch">
        <v-popup width="40px" type="hover" float="center">
          <template #active> ... </template>
          <template #content>
            <div
              v-for="j in value === -1 ? otherPrefPages : otherNextPages"
              :key="j"
              class="justify-center"
              @click="setPage(j - 1)"
            >
              {{ j }}
            </div>
          </template>
        </v-popup>
      </button>
    </template>
    <button
      v-wave="modelValue !== pageCount - 1"
      :disabled="modelValue === pageCount - 1"
      class="next"
      @click="setNext"
    >
      <ArrowSVG transform="rotate(90)" />
    </button>
  </div>
</template>

<style scoped lang="sass">

.pagination
  display: flex
  gap: 6px
  button
    font-weight: 300
    width: 28px
    height: 28px
    padding:0 4px
    cursor: pointer
    display: flex
    justify-content: center
    align-items: center
    transition: .2s
    color: var(--color-text)
    border-radius: 4px
    &:hover:not(.active):not([disabled])
      background: #EBF4F3
    &:disabled
      svg
        fill: var(--gray)
    &:focus-visible
      outline: 1px solid var(--color-text)
    svg
      fill: var(--color-text)
  .active
    color: #fff
    background: var(--color-main)

  .prev, .next
    &:focus-visible
      outline: 1px solid var(--color-text)
</style>
