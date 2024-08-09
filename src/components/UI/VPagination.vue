<script setup lang="ts">
import { computed } from 'vue'
import { arrayRange } from '@/utils/arrayRange'
import { ArrowSvg } from '@/assets/icons'
import VPopup from './VPopup.vue'

// prettier-ignore
type PageSlots = 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20

const props = defineProps<{
  itemCount: number
  pageSize: number
  pageSlots?: PageSlots
}>()

const emit = defineEmits<{
  click: []
}>()

const currentPage = defineModel<number>({ required: true })

const pageCount = computed(() => {
  return Math.ceil(props.itemCount / props.pageSize)
})

// -1 = prevAction, 0 = nextAction
const items = computed(() => {
  const count = pageCount.value
  const currentPageValue = currentPage.value
  const pageSlots = props.pageSlots ?? 7
  const isSlotsEven = pageSlots % 2 === 0
  const withOtherPrefPages = Math.ceil(pageSlots / 2)
  const togglePagesCount = pageSlots - 4
  const middlePageIndex = Math.floor(togglePagesCount / 2)

  if (count <= pageSlots) return arrayRange(1, count + 1)

  const isStartPosition = currentPageValue < withOtherPrefPages
  const isMiddlePosition =
    currentPageValue <= count - (withOtherPrefPages + (isSlotsEven ? 2 : 1))
  if (isStartPosition) {
    return [...arrayRange(1, pageSlots - 1), 0, count]
  }
  if (isMiddlePosition) {
    let minPage = currentPageValue - middlePageIndex + 1
    const maxPage = currentPageValue + middlePageIndex + 2
    if (isSlotsEven) {
      minPage += 1
    }
    return [1, -1, ...arrayRange(minPage, maxPage), 0, count]
  }
  return [1, -1, ...arrayRange(count - (pageSlots - 3), count + 1)]
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
  currentPage.value -= 1
  emit('click')
}

const setNext = () => {
  currentPage.value += 1
  emit('click')
}

const setPage = (page: number) => {
  currentPage.value = page
  emit('click')
}
</script>

<template>
  <div
    v-if="itemCount !== 0"
    class="pagination"
  >
    <button
      v-wave="currentPage !== 0"
      :disabled="currentPage === 0"
      type="button"
      class="prev"
      @click="setPrev"
    >
      <arrow-svg transform="rotate(-90)" />
    </button>
    <template
      v-for="(value, i) in items"
      :key="i"
    >
      <button
        v-if="value > 0"
        v-wave
        type="button"
        :class="{ active: currentPage + 1 === value }"
        @click="setPage(value - 1)"
      >
        {{ value }}
      </button>
      <template v-else>
        <v-popup
          min-width="40px"
          type="hover"
          float="center"
        >
          <template #active>
            <button
              type="button"
              class="page-switch"
            >
              ...</button
            >
          </template>
          <template #content>
            <button
              v-for="j in value === -1 ? otherPrefPages : otherNextPages"
              :key="j"
              type="button"
              class="justify-center popup__el"
              @click="setPage(j - 1)"
            >
              {{ j }}
            </button>
          </template>
        </v-popup>
      </template>
    </template>
    <button
      v-wave="currentPage !== pageCount - 1"
      type="button"
      :disabled="currentPage === pageCount - 1"
      class="next"
      @click="setNext"
    >
      <arrow-svg transform="rotate(90)" />
    </button>
  </div>
</template>

<style scoped lang="sass">
.pagination
  display: flex
  gap: 6px
  button:not(.popup__el)
    font-weight: 300
    width: 28px
    height: 28px
    padding:0 4px
    cursor: pointer
    display: flex
    justify-content: center
    align-items: center
    transition: .2s
    color: var(--main-semi-light)
    border-radius: 4px
    &.active
      color: #fff
      background: var(--main)
    &:hover:not(.active):not([disabled])
      background: #EBF4F3
    &:disabled
      cursor: no-drop
      svg
        fill: var(--gray)
    &:focus-visible
      outline: 1px solid var(--main-semi-light)
    svg
      fill: var(--main-semi-light)


  .prev, .next
    &:focus-visible
      outline: 1px solid var(--main-semi-light)
</style>
