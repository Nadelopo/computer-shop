<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import type { ComparisonProduct } from '@/types'

const props = defineProps<{
  products: ComparisonProduct[]
  currentCategoryId: number | null
}>()
const categoryProducts = computed((): ComparisonProduct[] => {
  return props.products.filter(
    (e) => e.categoryId.id === props.currentCategoryId
  )
})
const comparisonRef = ref<HTMLElement>()
const titleCellMargin = ref('0px')
const firstCellMargin = ref(0)
const widthCell = 235
const countitems = ref(0)

onMounted(() => {
  if (comparisonRef.value) {
    const widthContainer = comparisonRef.value.scrollWidth - widthCell
    countitems.value = Math.floor(widthContainer / widthCell)
    titleCellMargin.value = widthContainer - countitems.value * widthCell + 'px'
  }
})

const updateItemsList = (action: 'prev' | 'next') => {
  if (action === 'prev') {
    firstCellMargin.value = firstCellMargin.value - widthCell
  }
  if (action === 'next') {
    firstCellMargin.value = firstCellMargin.value + widthCell
  }
}

const showNextBtn = computed(() => {
  return firstCellMargin.value !== 0
})
const showPrevBtn = computed(() => {
  const outsideItemsCount = categoryProducts.value.length - countitems.value
  return outsideItemsCount * widthCell !== Math.abs(firstCellMargin.value)
})
</script>

<template>
  <div ref="comparisonRef" class="comparison">
    <div class="cell" :style="{ marginRight: titleCellMargin }">
      <div>Наименование</div>
    </div>
    <div class="cells">
      <button
        v-if="showPrevBtn"
        class="control__btn prev"
        @click="updateItemsList('prev')"
      >
        назад
      </button>
      <button
        v-if="showNextBtn"
        class="control__btn next"
        @click="updateItemsList('next')"
      >
        вперед
      </button>
      <div
        v-for="(product, i) in categoryProducts"
        :key="product.id"
        class="cell"
        :style="{ marginLeft: (i === 0 ? firstCellMargin : 0) + 'px' }"
      >
        <div class="mb-8">{{ product.name }}</div>
        <div>{{ product.warranty }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="sass">

.comparison
  display: flex
  .cells
    display: flex
    overflow: hidden
    position: relative
    .control__btn
      position: absolute
      top: 60px
      &.next
        right: 0
  .cell
    width: 235px
    min-width: 235px
    padding: 10px
    transition: .3s
</style>
