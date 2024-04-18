<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import { useElementSize, useMediaQuery, useResizeObserver } from '@vueuse/core'
import { formatPrice } from '@/utils/formatPrice'
import { useFeatureFilteredProducts } from './useFeatureFilteredProducts'
import IconButtonFavouritesComparison from '../IconButtonFavouritesComparison.vue'
import ButtonCart from '../ButtonCart.vue'
import AppLink from '../AppLink.vue'
import { ArrowSvg, CrossSvg } from '@/assets/icons'
import type { ComparisonProduct, CategorySpecifications } from './types'

const props = defineProps<{
  currentCategoryId: number | null
  products: ComparisonProduct[]
  currentCategorySpecifications: CategorySpecifications[]
  showDifferences: boolean
}>()

const emit = defineEmits<{
  deleteItem: [item: ComparisonProduct]
}>()

const categoryProducts = computed(() =>
  props.products.filter((e) => e.categoryId === props.currentCategoryId)
)

const { filteredProducts } = useFeatureFilteredProducts(
  categoryProducts,
  toRef(() => props.currentCategorySpecifications),
  toRef(() => props.showDifferences)
)

const transition = ref('.3s')
const cellRef = ref<HTMLElement>()
const { width: widthCell } = useElementSize(
  cellRef,
  { width: 0, height: 0 },
  { box: 'border-box' }
)
const countVisibleItems = ref(0)
const comparisonRef = ref<HTMLElement>()
const translateCells = ref(0)
useResizeObserver(comparisonRef, (entries) => {
  const comparisonWidth = entries[0].contentRect.width
  if (comparisonWidth <= 620) {
    countVisibleItems.value = 2
  } else {
    countVisibleItems.value = Math.floor(comparisonWidth / widthCell.value) - 1
  }
  translateCells.value = 0
  transition.value = '0'
  setTimeout(() => {
    transition.value = '.3s'
  }, 200)
})

const showPrevBtn = computed(() => {
  if (translateCells.value >= 0) {
    return false
  }
  return true
})
const showNextBtn = computed(() => {
  const maxTranslate = categoryProducts.value.length * widthCell.value
  const currentTranslate = Math.abs(
    translateCells.value - widthCell.value * countVisibleItems.value
  )
  if (
    currentTranslate >= maxTranslate ||
    categoryProducts.value.length <= countVisibleItems.value
  ) {
    return false
  }
  return true
})

const updateItemsList = (action: 'prev' | 'next') => {
  if (action === 'next') {
    translateCells.value -= widthCell.value
  }
  if (action === 'prev') {
    translateCells.value += widthCell.value
  }
}

const deleteItem = async (product: ComparisonProduct) => {
  emit('deleteItem', product)
  translateCells.value = 0
}

const onDrag = (e: DragEvent, i: string | number) => {
  if (!e.dataTransfer) return
  e.dataTransfer.dropEffect = 'move'
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('itemId', String(i))
}

const onDrop = (e: DragEvent, i: string | number) => {
  if (!e.dataTransfer) return
  const propsProducts = props.products
  const itemId = e.dataTransfer.getData('itemId')
  const index1 = propsProducts.findIndex((e) => e.img[0] === i)
  const index2 = propsProducts.findIndex((e) => e.img[0] === itemId)
  ;[propsProducts[index1], propsProducts[index2]] = [
    propsProducts[index2],
    propsProducts[index1]
  ]
}

const isSmall = useMediaQuery('(max-width: 420px)')
</script>

<template>
  <div
    ref="comparisonRef"
    class="comparison"
  >
    <div class="row">
      <div class="cell__title" />
      <div class="wrapper__cells">
        <div class="title__mobile" />
        <div
          class="cells"
          :style="{ translate: translateCells + 'px' }"
        >
          <div
            v-for="(product, i) in categoryProducts"
            :key="product.id"
            :ref="i === 0 && (!cellRef || !widthCell) ? (e) => (cellRef = e as HTMLElement) : undefined"
            :draggable="true"
            class="cell img"
            @dragstart="onDrag($event, product.img[0])"
            @drop="onDrop($event, product.img[0])"
            @dragover.prevent
            @dragenter.prevent
          >
            <div class="flex w-full">
              <app-link
                v-if="currentCategoryId"
                :to="{
                  name: 'Product',
                  params: {
                    category:
                      currentCategorySpecifications[0].categories.enTitle,
                    categoryId: currentCategoryId,
                    productId: product.id
                  }
                }"
              >
                <img
                  :src="String(product.img[0])"
                  alt=""
                />
              </app-link>
              <span class="ml-auto pr-4">
                <cross-svg
                  transform="rotate(45)"
                  class="cross"
                  @click="deleteItem(product)"
                />
                <icon-button-favourites-comparison
                  list-title="favourites"
                  :product-id="product.id"
                />
              </span>
            </div>
            <div class="flex gap-x-2 mt-4">
              <button-cart
                :product-id="product.id"
                :quantity="product.quantity"
                :width="isSmall ? 'auto' : undefined"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      v-for="(data, i) in filteredProducts"
      :key="i"
      class="row"
    >
      <div class="cell__title">
        {{ data.title }}
      </div>
      <div class="wrapper__cells">
        <div class="title__mobile">{{ data.title }}</div>
        <div
          class="cells"
          :style="{ translate: translateCells + 'px' }"
        >
          <div
            v-for="(value, j) in data.values"
            :key="j"
            class="cell"
          >
            <template v-if="data.title === 'Цена'">
              <div class="flex flex-col">
                <span
                  class="price"
                  :class="categoryProducts[j].discount ? 'discounted' : 'auto'"
                >
                  {{ formatPrice(categoryProducts[j].priceWithoutDiscount) }}
                </span>
                <span
                  v-if="categoryProducts[j].discount"
                  class="price coloured"
                >
                  {{ value }}
                </span>
              </div>
            </template>
            <template v-else>
              <span :class="{ best__value: data.max === value }">
                {{ value }} {{ data.units }}
              </span>
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
          v-show="showPrevBtn"
          class="control__btn prev"
          @click="updateItemsList('prev')"
        >
          <arrow-svg transform="rotate(-90)" />
        </button>
        <button
          v-show="showNextBtn"
          class="control__btn next"
          @click="updateItemsList('next')"
        >
          <arrow-svg transform="rotate(90)" />
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped lang="sass">
.comparison
  overflow: hidden
  .row
    display: flex
    border-radius: 6px
    transition: v-bind(transition) linear
    padding: 0 5px
    position: relative
    &:nth-child(odd)
      background: #fff
    &:not(:first-child):not(:has(button)):hover
      background: var(--main-light)

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
  .cell, .cell__title
    width: 235px
    padding: 20px 8px 20px 8px
    min-width: 235px
    display: flex
    align-items: center
    &.img
      flex-direction: column
      justify-content: space-between
      align-items: start
    .best__value
      color: var(--main-semi-light)
    a
      max-width: 70%
    img
      max-height: 150px
    @media (width <= 767px)
      padding-top: 0px
      min-width: auto
      width: 303px
      &:has(img) img
        padding-right: 10px
    @media (width <= 640px)
      width: Calc(50vw - 11px)
  .cell__title
    z-index: 10
    box-sizing: content-box
    font-weight: 500
    @media(max-width: 767px)
      display: none
  .control__btn
    position: absolute
    bottom: -16px
    z-index: 10
    background: #e5e5e5
    border-radius: 20px
    padding: 8px
    transition: .2s
    &:hover
      background: var(--main)
      fill: #fff
    &.next
        right: 10px
    &.prev
      left: 266px
      @media (width <= 767px)
        left: 10px

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
      color: var(--main)
  .cross
    transition: .2s
    cursor: pointer
    margin-bottom: 10px
    &:hover
      transform: scale(1.3)
</style>
