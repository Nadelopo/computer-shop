<script setup lang="ts">
import { useElementSize } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import { ArrowSvg } from '@/assets/icons'

type Props = {
  countSlides?: number
  countSwipeSlides?: number
  spaceBetween?: number
  draggable?: boolean
  showArrows?: boolean | 'hover'
}

const props = withDefaults(defineProps<Props>(), {
  countSlides: 1,
  spaceBetween: 0,
  countSwipeSlides: 1,
  draggable: false,
  showArrows: false
})

const carouselRef = ref<HTMLElement>()
const { width: carouselWidth } = useElementSize(carouselRef)
const slideWidth = computed(() => {
  const carouselWidthValue =
    carouselWidth.value - props.spaceBetween * (props.countSlides - 1)
  return carouselWidthValue / props.countSlides + 'px'
})
const translate = ref(0)
const startTranslate = ref(0)
const lastTranslate = computed(() => {
  if (!carouselRef.value) return 0
  const countItems =
    carouselRef.value.children[0].children.length - props.countSlides
  return (
    countItems * parseInt(slideWidth.value) + countItems * props.spaceBetween
  )
})
const swipeTranslate = computed(() => {
  return (
    (parseInt(slideWidth.value) + props.spaceBetween) * props.countSwipeSlides
  )
})
const carouselWrapperTransition = ref(3)

const carouselWrapperCss = computed(() => {
  return `gap: ${props.spaceBetween}px; translate: ${translate.value}px; transition: .${carouselWrapperTransition.value}s`
})

const swipeSlide = (direction: 'next' | 'prev') => {
  let newTranslate = 0
  if (direction === 'next') {
    const isLastElement = -translate.value === lastTranslate.value
    if (isLastElement) {
      translate.value = 0
      return
    }
    newTranslate = translate.value - swipeTranslate.value
    if (lastTranslate.value <= -newTranslate) {
      translate.value = -lastTranslate.value
      return
    }
    translate.value = newTranslate
  }
  if (direction === 'prev') {
    const isFirstElement = translate.value === 0
    if (isFirstElement) {
      translate.value = -lastTranslate.value
      return
    }
    newTranslate = translate.value + swipeTranslate.value
    if (newTranslate >= 0) {
      translate.value = 0
      return
    }
    translate.value = newTranslate
  }
}

const isMovable = ref(false)
const currentPosX = ref(0)
const startPosX = ref(0)

const move = (e: MouseEvent) => {
  isMovable.value = true
  if (e.clientX > currentPosX.value || e.clientX < currentPosX.value) {
    translate.value += e.clientX - currentPosX.value
  }
  currentPosX.value = e.clientX
}

const swipeByMouse = (e: MouseEvent) => {
  if (!props.draggable) return
  startTranslate.value = translate.value
  carouselWrapperTransition.value = 0
  startPosX.value = e.clientX
  currentPosX.value = e.clientX
  window.addEventListener('mousemove', move)
}

const stop = async (e: MouseEvent) => {
  if (!props.draggable) return
  carouselWrapperTransition.value = 3
  window.removeEventListener('mousemove', move)
  if (isMovable.value) {
    e.preventDefault()
    e.stopPropagation()
  }
  isMovable.value = false
}

watch(isMovable, () => {
  if (isMovable.value) return
  if (translate.value > 0) {
    translate.value = 0
    return
  }
  if (translate.value < -lastTranslate.value) {
    translate.value = -lastTranslate.value
    return
  }

  const direction = currentPosX.value > startPosX.value ? 'right' : 'left'

  const difference =
    Math.abs(currentPosX.value - startPosX.value) % swipeTranslate.value
  const isLessHalf = difference < swipeTranslate.value / 2
  let offsetBlocks = Math.floor(
    Math.abs(currentPosX.value - startPosX.value) / swipeTranslate.value
  )
  offsetBlocks += isLessHalf ? 0 : 1
  if (direction === 'right') {
    translate.value = startTranslate.value + swipeTranslate.value * offsetBlocks
    return
  }
  if (direction === 'left') {
    translate.value = startTranslate.value - swipeTranslate.value * offsetBlocks
    return
  }
})
</script>

<template>
  <div
    ref="carouselRef"
    class="carousel"
    @mousedown.prevent.left="swipeByMouse"
    @mouseleave="stop"
    @click.capture="stop"
  >
    <div class="carousel__wrapper" :style="carouselWrapperCss">
      <slot />
    </div>

    <template v-for="direction in (['prev', 'next'] as const)" :key="direction">
      <ArrowSvg
        v-show="showArrows"
        class="action"
        :class="{ hover: showArrows === 'hover', [direction]: true }"
        @click="swipeSlide(direction)"
        @mousedown.stop
      />
    </template>
  </div>
</template>

<style lang="sass">
.carousel
  position: relative
  overflow: hidden
  &:hover
    .action.hover
      opacity: 1
      &.prev
        left: 20px
      &.next
        right: 20px
  .carousel__container
    overflow: hidden
  .action
    position: absolute
    top: calc( 50% - 20px )
    cursor: pointer
    width: 40px
    background: #fff
    border-radius: 50px
    padding: 10px
    transition: .2s
    fill: #8c8c8c
    box-shadow: 0 4px 10px #0000001a
    &.hover
      opacity: 0
      &.prev
        left: -40px
      &.next
        right: -40px
    &:hover
      background: var(--color-main)
      fill: #fff
    &.next
      rotate: 90deg
      right: 10px
    &.prev
      left: 10px
      rotate: -90deg
  .carousel__wrapper
    display: flex
    .carousel__slide
      min-width: v-bind(slideWidth)
</style>
