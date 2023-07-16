<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useElementSize } from '@vueuse/core'
import ArrowSVG from '@/assets/icons/arrow.svg?component'
import type {
  Category,
  ComparisonProduct,
  CurrentCategory,
  BasicProductData
} from './types'

const props = defineProps<{
  products: ComparisonProduct[]
  currentCategory: CurrentCategory
  categories: Category[]
  showDifferences: boolean
}>()

const getSpecificationValue = (
  products: ComparisonProduct[],
  i: number,
  j: number
) => {
  const specification = products[i].specifications[j]
  const value = specification.valueNumber ?? specification.valueString
  return value
}

const categoryProducts = computed((): ComparisonProduct[] => {
  const products = props.products.filter(
    (e) => e.categoryId === props.currentCategory.id
  )
  if (!props.showDifferences || products.length <= 1) return products
  else {
    let filteredProducts: ComparisonProduct[] = products.map((e) => ({
      ...e,
      specifications: []
    }))
    const specificationsCount = products[0].specifications.length
    for (let i = 0; i < specificationsCount; i++) {
      const firstSpecificationValue = getSpecificationValue(products, 0, i)
      const isSpecificationsDiefferent = !products.every(
        (_, j) =>
          getSpecificationValue(products, j, i) === firstSpecificationValue
      )
      if (isSpecificationsDiefferent) {
        filteredProducts.forEach((p, index) =>
          p.specifications.push(products[index].specifications[i])
        )
      }
    }
    return filteredProducts
  }
})

const comparisonRef = ref<HTMLElement>()
const { width: comparisonWidth } = useElementSize(comparisonRef)
const firstCellMargin = ref(0)
const widthCell = ref('235px')
const horizontalPaddingCell = '10px'
const countItems = ref(0)
const widthCells = ref('0px')

const calculateWidths = () => {
  if (!comparisonRef.value) return

  let widthContainer = 0
  if (comparisonWidth.value <= 616) {
    widthCell.value = comparisonWidth.value / 2 + 'px'
    widthContainer = comparisonWidth.value
  } else {
    widthCell.value = '235px'
    widthContainer = comparisonWidth.value - parseInt(widthCell.value)
  }

  countItems.value = Math.floor(widthContainer / parseInt(widthCell.value))
  widthCells.value = countItems.value * parseInt(widthCell.value) + 'px'
}

watch(comparisonWidth, () => {
  calculateWidths()
  firstCellMargin.value = 0
  firstCellIndex.value = 1
})

const titles = computed(() => categoryProducts.value.map((e) => e.name))

const productData = computed(() => {
  const data: BasicProductData[] = []

  const products = categoryProducts.value

  const manufacturers: BasicProductData = {
    title: 'Производитель',
    value: products.map((e) => e.manufacturers.title),
    units: ''
  }
  const warranty: BasicProductData = {
    title: 'Гарантия',
    value: products.map((e) => e.warranty),
    units: 'мес'
  }

  if (!props.showDifferences || products.length <= 1) {
    data.push(manufacturers)
    data.push(warranty)
  } else {
    const isManufacturersDifferent = !products.every(
      (e) => e.manufacturers.title === products[0].manufacturers.title
    )
    const isWarrantiesDifferent = !products.every(
      (e) => e.warranty === products[0].warranty
    )
    if (isManufacturersDifferent) {
      data.push(manufacturers)
    }
    if (isWarrantiesDifferent) {
      data.push(warranty)
    }
  }

  return data
})

const firstCellIndex = ref(1)
const updateItemsList = (action: 'prev' | 'next') => {
  if (action === 'next') {
    firstCellIndex.value++
    firstCellMargin.value -= parseInt(widthCell.value)
  }
  if (action === 'prev') {
    firstCellIndex.value--
    firstCellMargin.value += parseInt(widthCell.value)
  }
}

const showPrevBtn = computed(() => {
  if (categoryProducts.value.length < countItems.value) return false
  return firstCellMargin.value !== 0
})
const showNextBtn = computed(() => {
  if (categoryProducts.value.length < countItems.value) return false
  const outsideItemsCount = categoryProducts.value.length - countItems.value
  return (
    outsideItemsCount * parseInt(widthCell.value) !==
    Math.abs(firstCellMargin.value)
  )
})

const prevBtnStyleLeft = computed(() => {
  if (comparisonWidth.value <= 616) return horizontalPaddingCell
  const left = parseInt(horizontalPaddingCell) * 3 + parseInt(widthCell.value)
  return left + 'px'
})

watch(
  () => props.currentCategory.id,
  () => {
    firstCellMargin.value = 0
    firstCellIndex.value = 1
  }
)

const setRowColor = (e: Event, value: 'add' | 'remove') => {
  const target = e.target as HTMLElement
  if (value === 'add') {
    target.style.background = 'var(--light)'
  }
  if (value === 'remove') {
    target.style.background = 'unset'
  }
}

const onChildRow = (e: Event, value: 'add' | 'remove') => {
  const target = e.target as HTMLElement
  const parent = target.parentElement
  if (!parent) return
  if (value === 'add') {
    parent.style.background = 'unset'
  }
  if (value === 'remove') {
    parent.style.background = 'var(--light)'
  }
}
</script>

<template>
  <div ref="comparisonRef" class="comparison">
    <div class="overflow-hidden">
      <div
        class="relative mb-4 row"
        @mouseenter="setRowColor($event, 'add')"
        @mouseleave="setRowColor($event, 'remove')"
      >
        <div class="cell__title"> Наименование</div>

        <div class="cells">
          <div
            v-for="(title, i) in titles"
            :key="title"
            class="cell"
            :style="{ marginLeft: i === 0 ? firstCellMargin + 'px' : '' }"
          >
            <div
              v-if="i === firstCellIndex - 1 && comparisonWidth <= 616"
              class="font-medium"
            >
              Наименование
            </div>
            {{ title }}
          </div>
        </div>

        <button
          v-if="showPrevBtn"
          class="control__btn prev"
          :style="{
            left: prevBtnStyleLeft
          }"
          @click="updateItemsList('prev')"
          @mouseenter="onChildRow($event, 'add')"
          @mouseleave="onChildRow($event, 'remove')"
        >
          <ArrowSVG transform="rotate(-90)" />
        </button>
        <button
          v-if="showNextBtn"
          class="control__btn next"
          @click="updateItemsList('next')"
          @mouseenter="onChildRow($event, 'add')"
          @mouseleave="onChildRow($event, 'remove')"
        >
          <ArrowSVG transform="rotate(90)" />
        </button>
      </div>

      <div
        v-for="i in categoryProducts[0]?.specifications.length"
        :key="categoryProducts[0].specifications[i - 1].id"
        class="row"
        @mouseenter="setRowColor($event, 'add')"
        @mouseleave="setRowColor($event, 'remove')"
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
            <div
              v-if="j === firstCellIndex && comparisonWidth <= 616"
              class="font-medium"
            >
              {{ currentCategory.specifications[i - 1].title }}
            </div>
            {{ categoryProducts[j - 1].specifications[i - 1].valueNumber }}
            {{ categoryProducts[j - 1].specifications[i - 1].valueString }}
            {{ currentCategory.specifications[i - 1].units }}
          </div>
        </div>
      </div>

      <template v-for="(el, i) in productData" :key="i">
        <div
          class="row"
          @mouseenter="setRowColor($event, 'add')"
          @mouseleave="setRowColor($event, 'remove')"
        >
          <div class="cell__title"> {{ el.title }}</div>
          <div class="cells">
            <div
              v-for="(subEl, j) in el.value"
              :key="j"
              class="cell"
              :style="{ marginLeft: j === 0 ? firstCellMargin + 'px' : '' }"
            >
              <div
                v-if="j === firstCellIndex - 1 && comparisonWidth <= 616"
                class="font-medium"
              >
              </div>
              {{ subEl }} {{ el.units }}
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="sass">
.comparison
  display: flex
  user-select: none
  .row
    display: flex
    border-radius: 6px
    transition: .3s linear
  .cells
    display: flex
    overflow: hidden
    position: relative
    width: v-bind(widthCells)
    @media (width <= 767px)
      overflow: visible
      width: auto
  .control__btn
    position: absolute
    bottom: -20px
    z-index: 100
    background: #e5e5e5
    border-radius: 20px
    padding: 8px
    transition: .2s
    &:hover
      background: var(--color-main)
      fill: #fff
    &.next
      right: 0
  .cell, .cell__title
    width: v-bind(widthCell)
    padding: 20px v-bind(horizontalPaddingCell)
    transition: margin .3s
    @media (width > 500px)
        min-width: 235px
  .cell__title
    z-index: 10
    box-sizing: content-box
    font-weight: 500
    @media(max-width: 767px)
      display: none
</style>
