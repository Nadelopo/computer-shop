<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useElementSize } from '@vueuse/core'
import ArrowSVG from '@/assets/icons/arrow.svg?component'
import type {
  ComparisonProduct,
  BasicProductData,
  CategorySpecifications
} from './types'

const props = defineProps<{
  currentCategoryId: number | null
  products: ComparisonProduct[]
  currentCategorySpecifications: CategorySpecifications[]
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
    (e) => e.categoryId === props.currentCategoryId
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
const translateCells = ref(0)
const widthCell = ref(235)
const countItems = ref(0)

const isMobileWidth = computed(() => {
  return comparisonWidth.value <= 620
})

const calculateWidths = () => {
  if (!comparisonRef.value) return

  let widthContainer = 0
  if (isMobileWidth.value) {
    widthCell.value = comparisonWidth.value / 2
    widthContainer = comparisonWidth.value
  } else {
    widthCell.value = 235
    widthContainer = comparisonWidth.value - widthCell.value
  }

  countItems.value = Math.floor(widthContainer / widthCell.value)
}

watch(comparisonWidth, () => {
  calculateWidths()
  translateCells.value = 0
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

const updateItemsList = (action: 'prev' | 'next') => {
  if (action === 'next') {
    translateCells.value -= widthCell.value
  }
  if (action === 'prev') {
    translateCells.value += widthCell.value
  }
}

const showPrevBtn = computed(() => {
  if (categoryProducts.value.length < countItems.value) return false
  return translateCells.value !== 0
})
const showNextBtn = computed(() => {
  if (categoryProducts.value.length < countItems.value) return false
  const outsideItemsCount = categoryProducts.value.length - countItems.value
  return outsideItemsCount * widthCell.value !== Math.abs(translateCells.value)
})

const transition = ref('.3s')
watch(
  () => props.currentCategoryId,
  async () => {
    translateCells.value = 0
    transition.value = '0s'
    await nextTick()
    transition.value = '.3s'
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

const styles = computed(() => {
  const translateX = translateCells.value + 'px'
  const width = widthCell.value + 'px'
  return { translateX, width }
})
</script>

<template>
  <div ref="comparisonRef" class="comparison">
    <div class="overflow-hidden">
      <div class="relative row">
        <div class="cell__title"> Наименование</div>
        <div class="wrapper__cells">
          <div v-if="isMobileWidth" class="title__mobile"> Наименование </div>
          <div class="cells">
            <div v-for="title in titles" :key="title" class="cell">
              {{ title }}
            </div>
          </div>
        </div>

        <button
          v-if="showPrevBtn"
          class="control__btn prev"
          @click="updateItemsList('prev')"
        >
          <ArrowSVG transform="rotate(-90)" />
        </button>
        <button
          v-if="showNextBtn"
          class="control__btn next"
          @click="updateItemsList('next')"
        >
          <ArrowSVG transform="rotate(90)" />
        </button>
      </div>

      <div
        v-for="(__, i) in categoryProducts[0]?.specifications.length"
        :key="categoryProducts[0].specifications[i].id"
        class="row"
        @mouseenter="setRowColor($event, 'add')"
        @mouseleave="setRowColor($event, 'remove')"
      >
        <div class="cell__title">
          {{ currentCategorySpecifications[i].title }}
        </div>
        <div class="wrapper__cells">
          <div v-if="isMobileWidth" class="title__mobile">
            {{ currentCategorySpecifications[i].title }}
          </div>
          <div class="cells">
            <div
              v-for="(_, j) in categoryProducts.length"
              :key="categoryProducts[j].id"
              class="cell"
            >
              {{ categoryProducts[j].specifications[i].valueNumber }}
              {{ categoryProducts[j].specifications[i].valueString }}
              {{ currentCategorySpecifications[i].units }}
            </div>
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
          <div class="wrapper__cells">
            <div v-if="isMobileWidth" class="title__mobile">
              {{ el.title }}
            </div>
            <div class="cells">
              <div v-for="(subEl, j) in el.value" :key="j" class="cell">
                {{ subEl }} {{ el.units }}
              </div>
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
  cursor: default
  .row
    display: flex
    border-radius: 6px
    transition: .3s linear
    padding: 0 10px
  .wrapper__cells
    position: relative
    overflow: hidden
    @media (width <= 1535px)
      width: 940px
    @media (width <= 1279px)
      width: 705px
    @media (width <= 1023px)
      width: 470px
    @media (width <= 767px)
      width: auto
      overflow: visible
    .title__mobile
      font-weight: 500
      @media (width <= 767px)
        padding-top: 20px
  .cells
    display: flex
    transition: v-bind(transition)
    position: relative
    transform: translateX(v-bind('styles.translateX'))
  .cell, .cell__title
    width: v-bind('styles.width')
    padding: 20px 10px 20px 0
    min-width: 235px
    @media (width <= 767px)
      padding-top: 0px
      min-width: auto
  .cell__title
    z-index: 10
    box-sizing: content-box
    font-weight: 500
    @media(max-width: 767px)
      display: none
  .control__btn
    position: absolute
    bottom: -20px
    z-index: 10
    background: #e5e5e5
    border-radius: 20px
    padding: 8px
    transition: .2s
    &:hover
      background: var(--color-main)
      fill: #fff
    &.next
      right: 0
      @media (width < 768px)
        right: 10px
    &.prev
      margin-left: 245px
      @media (width <= 767px)
        margin-left: 0
</style>
