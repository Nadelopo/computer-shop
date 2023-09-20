<script setup lang="ts">
import { useElementSize } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import { ArrowSvg } from '@/assets/icons'

type Props = {
  countSlides?: number
  countSwipeSlides?: number
  spaceBetween?: number
}

const props = withDefaults(defineProps<Props>(), {
  countSlides: 1,
  spaceBetween: 0,
  countSwipeSlides: 1
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
  console.log(direction)
  let newTranslate = 0
  if (direction === 'next') {
    newTranslate = translate.value - swipeTranslate.value
    const isLastElement = -translate.value === lastTranslate.value
    if (isLastElement) {
      translate.value = 0
      return
    }
    if (lastTranslate.value <= -newTranslate) {
      translate.value = -lastTranslate.value
      return
    }
    translate.value = newTranslate
  }
  if (direction === 'prev') {
    newTranslate = translate.value + swipeTranslate.value
    const isFirstElement = translate.value === 0
    if (isFirstElement) {
      translate.value = -lastTranslate.value
      return
    }
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
  startTranslate.value = translate.value
  carouselWrapperTransition.value = 0
  startPosX.value = e.clientX
  currentPosX.value = e.clientX
  window.addEventListener('mousemove', move)
}

const stop = async (e: MouseEvent) => {
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
  const difference = Math.abs(currentPosX.value - startPosX.value)
  console.log(direction)
  if (difference < swipeTranslate.value / 2) {
    translate.value = startTranslate.value
  } else {
    if (direction === 'right') {
      translate.value = startTranslate.value + swipeTranslate.value
    }
    if (direction === 'left') {
      translate.value = startTranslate.value - swipeTranslate.value
    }
  }
})
</script>

<template>
  <div ref="carouselRef" class="carousel">
    <div
      class="carousel__wrapper"
      :style="carouselWrapperCss"
      @mousedown.prevent.left="swipeByMouse"
      @mouseleave="stop"
      @click.capture="stop"
    >
      <slot />
    </div>
    <ArrowSvg class="action prev" @click="swipeSlide('prev')" />
    <ArrowSvg class="action next" @click="swipeSlide('next')" />
  </div>
</template>

<style lang="sass">
.carousel
  position: relative
  overflow: hidden
  // user-select: none
  .carousel__container
    overflow: hidden
  .action
    position: absolute
    top: calc( 50% - 18px )
    cursor: pointer
    width: 34px
    background: var(--color-main)
    border-radius: 50px
    padding: 6px
    transition: .2s
    fill: #fff
    &:hover
      background: var(--color-text)
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
