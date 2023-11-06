<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import { useElementSize, useResizeObserver } from '@vueuse/core'
import { ArrowSvg, CrossSvg } from '@/assets/icons'
import { useFeatureFilteredProducts } from './useFeatureFilteredProducts'
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

let previousColor = '#fff'
const setRowColor = (e: Event, value: 'add' | 'remove') => {
  const target = e.target as HTMLElement
  if (value === 'add') {
    previousColor = target.style.backgroundColor
    target.style.background = 'var(--light)'
  }
  if (value === 'remove') {
    target.style.background = previousColor
  }
}

const updateItemsList = (action: 'prev' | 'next') => {
  if (action === 'next') {
    translateCells.value -= widthCell.value
  }
  if (action === 'prev') {
    translateCells.value += widthCell.value
  }
}

const deleteItem = async (index: number) => {
  const item = categoryProducts.value[index]
  emit('deleteItem', item)
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
</script>

<template>
  <div
    ref="comparisonRef"
    class="comparison"
  >
    <div
      v-for="(data, i) in filteredProducts"
      :key="i"
      :class="{ 'bg-white': i % 2 === 0 }"
      class="row"
      v-on="i > 1 ? { 
          mouseenter: (e: MouseEvent) => setRowColor(e, 'add'),
          mouseleave: (e: MouseEvent) => setRowColor(e, 'remove') 
         } : {}"
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
            :ref="j === 0 && i === 0 && !cellRef ? (e) => (cellRef = e as HTMLElement) : undefined"
            :draggable="i === 0 ? true : undefined"
            class="cell"
            v-on="i === 0 ? {
              dragstart: (e: DragEvent) => onDrag(e, value),
              drop: (e: DragEvent) => onDrop(e, value),
              dragover: (e: DragEvent) => e.preventDefault(),
              dragenter: (e: DragEvent) => e.preventDefault()
            } : {}"
          >
            <template v-if="i === 0">
              <router-link
                :to="{
                  name: 'Product',
                  params: {
                    category: currentCategorySpecifications[0].categories.enTitle,
                    categoryId: currentCategoryId,
                    productId: products.find(p => p.img[0] === (value as string))?.id
                  }
                }"
              >
                <img
                  :src="String(value)"
                  alt=""
                />
              </router-link>
              <cross-svg
                class="cross"
                @click="deleteItem(j)"
              />
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
    .best__value
      color: var(--color-text)
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
      background: var(--color-main)
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
      color: var(--color-main)
  .cross
    transition: .2s
    cursor: pointer
    margin: 0 20px auto auto
    &:hover
      transform: scale(1.3)
</style>
