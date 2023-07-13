<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import type { Category, ComparisonProduct, CurrentCategory } from './types'

const props = defineProps<{
  products: ComparisonProduct[]
  currentCategory: CurrentCategory
  categories: Category[]
}>()

const categoryProducts = computed((): ComparisonProduct[] => {
  return props.products.filter((e) => e.categoryId === props.currentCategory.id)
})
const comparisonRef = ref<HTMLElement>()
const titleCellPadding = ref('0px')
const firstCellMargin = ref(0)
const widthCell = 235
const paddingCell = '10px'
const countitems = ref(0)

onMounted(() => {
  if (comparisonRef.value) {
    const widthContainer = comparisonRef.value.scrollWidth - widthCell
    countitems.value = Math.floor(widthContainer / widthCell)
    titleCellPadding.value =
      widthContainer -
      countitems.value * widthCell -
      parseInt(paddingCell) +
      'px'
  }
})

const productData = computed(() => {
  const titles = categoryProducts.value.map((e) => e.name)
  const manufacturers = categoryProducts.value.map((e) => e.manufacturers.title)
  const warranties = categoryProducts.value.map((e) => e.warranty)
  return { titles, manufacturers, warranties }
})

const updateItemsList = (action: 'prev' | 'next') => {
  if (action === 'next') {
    firstCellMargin.value = firstCellMargin.value - widthCell
  }
  if (action === 'prev') {
    firstCellMargin.value = firstCellMargin.value + widthCell
  }
}

const showPrevBtn = computed(() => {
  if (categoryProducts.value.length === 1) return false
  return firstCellMargin.value !== 0
})
const showNextBtn = computed(() => {
  if (categoryProducts.value.length === 1) return false
  const outsideItemsCount = categoryProducts.value.length - countitems.value
  return outsideItemsCount * widthCell !== Math.abs(firstCellMargin.value)
})

const prevBtnStyleLef = computed(() => {
  const left =
    parseInt(titleCellPadding.value) + parseInt(paddingCell) * 2 + widthCell
  return left + 'px'
})

watch(
  () => props.currentCategory.id,
  () => {
    firstCellMargin.value = 0
  }
)
</script>

<template>
  <div ref="comparisonRef" class="comparison">
    <div class="overflow-hidden">
      <div class="flex relative mb-4">
        <div class="cell__title"> Наименование</div>
        <div
          v-for="(title, i) in productData.titles"
          :key="title"
          class="cell"
          :style="{ marginLeft: i === 0 ? firstCellMargin + 'px' : '' }"
        >
          {{ title }}
        </div>
        <button
          v-if="showPrevBtn"
          class="control__btn prev"
          :style="{
            left: prevBtnStyleLef
          }"
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
      </div>
      <div
        v-for="i in categoryProducts[0].specifications.length"
        :key="categoryProducts[0].specifications[i - 1].id"
        class="flex"
      >
        <div class="cell__title">
          {{ currentCategory.specifications[i - 1].title }}
        </div>
        <div class="cells">
          <div
            v-for="j in categoryProducts.length"
            :key="categoryProducts[j - 1].id"
            class="cell"
            :style="{ marginLeft: j === 1 ? firstCellMargin + 'px' : '' }"
          >
            {{ categoryProducts[j - 1].specifications[i - 1].valueNumber }}
            {{ categoryProducts[j - 1].specifications[i - 1].valueString }}
            {{ currentCategory.specifications[i - 1].units }}
          </div>
        </div>
      </div>

      <div class="flex">
        <div class="cell__title"> Производитель </div>
        <div
          v-for="(manufacturer, i) in productData.manufacturers"
          :key="manufacturer"
          class="cell"
          :style="{ marginLeft: i === 0 ? firstCellMargin + 'px' : '' }"
        >
          {{ manufacturer }}
        </div>
      </div>
      <div class="flex">
        <div class="cell__title">Гарантия</div>
        <div
          v-for="(warranty, i) in productData.warranties"
          :key="warranty"
          class="cell"
          :style="{ marginLeft: i === 0 ? firstCellMargin + 'px' : '' }"
        >
          {{ warranty }} мес
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="sass">

.comparison
  display: flex
  .cells
    display: flex
    // overflow: hidden
    position: relative
  .control__btn
    position: absolute
    bottom: -20px
    z-index: 100
    &.next
      right: 0
  .cell, .cell__title
    width: 235px
    min-width: 235px
    padding: v-bind(paddingCell)
    transition: .3s
  .cell__title
    background: var(--body-back)
    z-index: 10
    box-sizing: content-box
    padding-right: v-bind(titleCellPadding)
    @media(max-width: 767px)
      display: none
</style>
