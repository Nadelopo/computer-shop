<script setup lang="ts">
import { ref, computed, watch, nextTick, ComponentPublicInstance } from 'vue'
import { useResizeObserver } from '@vueuse/core'
import { formatPrice } from '@/utils/formatPrice'
import { ArrowSvg, CrossSvg } from '@/assets/icons'
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

const emit = defineEmits<{
  deleteItem: [item: ComparisonProduct]
}>()

const getSpecificationValue = (
  products: ComparisonProduct[],
  productIndex: number,
  specificationIndex: number
) => {
  const specification =
    products[productIndex].specifications[specificationIndex]
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

const translateCells = ref(0)
const widthCell = ref(235)
const countVisibleItems = ref(0)
const cellRef = ref<HTMLElement>()
useResizeObserver(cellRef, (entries) => {
  const borderBoxSize = entries[0].borderBoxSize
  if (!borderBoxSize?.length) return
  widthCell.value = borderBoxSize[0].inlineSize
})
const comparisonRef = ref<HTMLElement>()
useResizeObserver(comparisonRef, (entries) => {
  setCountVisibleItems(entries[0].contentRect.width)
  translateCells.value = 0
})

const setCountVisibleItems = (comparisonWidth: number) => {
  if (comparisonWidth <= 620) {
    countVisibleItems.value = 2
    return
  }
  countVisibleItems.value = Math.floor(comparisonWidth / widthCell.value) - 1
}

const productTopData = computed(() => {
  return [
    {
      title: '',
      value: categoryProducts.value.map((e) => e.img)
    },
    {
      title: 'Наименование',
      value: categoryProducts.value.map((e) => e.name)
    },
    {
      title: 'Рейтинг',
      value: categoryProducts.value.map((e) => e.rating.toFixed(1))
    },
    {
      title: 'Цена',
      value: categoryProducts.value.map((e) => formatPrice(e.price))
    }
  ]
})

const productBottomData = computed(() => {
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
  if (categoryProducts.value.length < countVisibleItems.value) return false
  return translateCells.value !== 0
})
const showNextBtn = computed(() => {
  if (categoryProducts.value.length < countVisibleItems.value) return false
  const outsideItemsCount =
    categoryProducts.value.length - countVisibleItems.value
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

watch(
  () => props.showDifferences,
  async () => {
    transition.value = '0s'
    setTimeout(() => {
      transition.value = '.3s'
    })
  }
)

const previousColor = ref('#fff')
const setRowColor = (e: Event, value: 'add' | 'remove') => {
  const target = e.target as HTMLElement
  if (value === 'add') {
    previousColor.value = target.style.backgroundColor
    target.style.background = 'var(--light)'
  }
  if (value === 'remove') {
    target.style.background = previousColor.value
  }
}

const translate = computed(() => {
  return translateCells.value + 'px'
})

const deleteItem = async (index: number) => {
  const item = categoryProducts.value[index]
  emit('deleteItem', item)
  translateCells.value = 0
}

const setCellRef = (val: Element | ComponentPublicInstance | null) => {
  if (cellRef.value) return
  cellRef.value = val as HTMLElement
}
</script>

<template>
  <div
    ref="comparisonRef"
    class="comparison"
  >
    <div class="overflow-hidden">
      <div
        v-for="(data, i) in productTopData"
        :key="data.title"
        class="relative row"
        :class="{ 'bg-white': i % 2 === 0 }"
      >
        <div class="cell__title">{{ data.title }}</div>
        <div class="wrapper__cells">
          <div class="title__mobile">
            {{ data.title }}
          </div>
          <div class="cells">
            <div
              v-for="(value, j) in data.value"
              :key="j"
              class="cell flex items-center"
            >
              <template v-if="data.title === ''">
                <img
                  :src="value"
                  alt="..."
                />
                <cross-svg
                  class="cross"
                  @click="deleteItem(j)"
                />
              </template>
              <template v-else>
                <span>{{ value }} </span>
                <label
                  v-if="data.title === 'Рейтинг'"
                  class="rating"
                  :class="{ coloured: Number(value) > 0 }"
                />
              </template>
            </div>
          </div>
        </div>
        <template v-if="data.title === 'Наименование'">
          <button
            v-if="showPrevBtn"
            class="control__btn prev"
            @click="updateItemsList('prev')"
          >
            <arrow-svg transform="rotate(-90)" />
          </button>
          <button
            v-if="showNextBtn"
            class="control__btn next"
            @click="updateItemsList('next')"
          >
            <arrow-svg transform="rotate(90)" />
          </button>
        </template>
      </div>

      <div
        v-for="(__, i) in categoryProducts[0]?.specifications.length"
        :key="categoryProducts[0].specifications[i].id"
        class="row"
        :class="{ 'bg-white': i % 2 === 0 }"
        @mouseenter="setRowColor($event, 'add')"
        @mouseleave="setRowColor($event, 'remove')"
      >
        <div class="cell__title">
          {{ currentCategorySpecifications[i].title }}
        </div>
        <div class="wrapper__cells">
          <div class="title__mobile">
            {{ currentCategorySpecifications[i].title }}
          </div>
          <div class="cells">
            <div
              v-for="(_, j) in categoryProducts.length"
              :key="categoryProducts[j].id"
              class="cell"
            >
              {{ getSpecificationValue(categoryProducts, j, i) }}
              {{ currentCategorySpecifications[i].units }}
            </div>
          </div>
        </div>
      </div>

      <template
        v-for="(el, i) in productBottomData"
        :key="i"
      >
        <div
          class="row"
          :class="{
            'bg-white': i % 2 === categoryProducts[0]?.specifications.length % 2
          }"
          @mouseenter="setRowColor($event, 'add')"
          @mouseleave="setRowColor($event, 'remove')"
        >
          <div class="cell__title">{{ el.title }}</div>
          <div class="wrapper__cells">
            <div class="title__mobile">
              {{ el.title }}
            </div>
            <div class="cells">
              <div
                v-for="(subEl, j) in el.value"
                :key="j"
                :ref="setCellRef"
                class="cell"
              >
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
    transition: v-bind(transition) linear
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
      display: none
      @media (width <= 767px)
        padding-top: 20px
        display: block
  .cells
    display: flex
    transition: v-bind(transition)
    position: relative
    translate: v-bind(translate)
  .cell, .cell__title
    width: 235px
    padding: 20px 10px 20px 0
    min-width: 235px
    img
      max-height: 150px
      max-width: 70%
    @media (width <= 767px)
      padding-top: 0px
      min-width: auto
      width: 308px
      &:has(img) img
        padding-right: 10px
    @media (width <= 640px)
      width: Calc(50vw - 12px)
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
  .rating
    margin-left: 6px
    width: 32px
    padding: 0
    font-size: 32px
    line-height: 32px
    text-shadow: 1px 1px #bbb
    color: lightgrey
    &:before
      content: '★'
    &.coloured
      color: var(--color-main)
  .cross
    transition: .2s
    cursor: pointer
    margin: 0 20px auto auto
    &:hover
      transform: scale(1.3)
</style>
