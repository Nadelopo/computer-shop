<script setup lang="ts">
import { useElementSize } from '@vueuse/core'
import { computed, onUnmounted, ref, watch } from 'vue'
import { ArrowSvg } from '@/assets/icons'

type Props = {
  slidesPerView?: number
  countSwipeSlides?: number
  spaceBetween?: number
  draggable?: boolean
  showArrows?: boolean | 'hover'
  showDots?: boolean
  dotType?: 'dot' | 'line'
  autoplay?: boolean | number
}

const props = withDefaults(defineProps<Props>(), {
  slidesPerView: 1,
  spaceBetween: 0,
  countSwipeSlides: 1,
  draggable: false,
  showArrows: false,
  dotType: 'line',
  autoplay: false
})

const translate = ref(0)
const startTranslate = ref(0)
const carouselRef = ref<HTMLElement>()
const isMovable = ref(false)
const autoplay = {
  value: 0,
  stop() {
    if (!props.autoplay) return
    clearInterval(this.value)
  },
  start() {
    if (!props.autoplay) return
    this.stop()
    const timeInterval =
      typeof props.autoplay === 'number' ? props.autoplay : 5000
    this.value = window.setInterval(() => {
      console.log('interval')
      swipeSlideByClick('next')
    }, timeInterval)
  }
}
const currentSlideIndex = ref(0)
const setCurrentSlideIndex = () => {
  if (translate.value >= 0) {
    currentSlideIndex.value = 0
    return
  }
  if (translate.value <= -lastTranslate.value) {
    currentSlideIndex.value = countSlides.value - 1
    return
  }
  currentSlideIndex.value = Math.ceil(-translate.value / swipeTranslate.value)
}

const { width: carouselWidth } = useElementSize(carouselRef)
const countSlides = computed(() => {
  return Math.ceil(lastTranslate.value / swipeTranslate.value) + 1
})
const slideWidth = computed(() => {
  const carouselWidthValue =
    carouselWidth.value - props.spaceBetween * (props.slidesPerView - 1)
  return carouselWidthValue / props.slidesPerView + 'px'
})
const lastTranslate = computed(() => {
  if (!carouselRef.value) return 0
  const countItems =
    carouselRef.value.children[0].children.length - props.slidesPerView
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

const swipeSlideByClick = (direction: 'next' | 'prev') => {
  // console.log('swipeSlideByClick')
  try {
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
  } finally {
    setCurrentSlideIndex()
  }
}

const currentPosX = ref(0)
const startPosX = ref(0)
const touchMoveDirection = ref<'vertical' | 'horizontal' | null>(null)

const onMove = (e: MouseEvent | TouchEvent) => {
  // console.log('move')
  const { clientX } = e instanceof MouseEvent ? e : e.touches[0]

  if (e instanceof MouseEvent) {
    touchMoveDirection.value = null
  } else if (e instanceof TouchEvent && !isMovable.value) {
    touchMoveDirection.value =
      Math.abs(clientX - startPosX.value) > 8 ? 'horizontal' : 'vertical'
  }

  isMovable.value = true
  if (touchMoveDirection.value === 'vertical') return
  if (touchMoveDirection.value === 'horizontal') e.preventDefault()
  if (clientX > currentPosX.value || clientX < currentPosX.value) {
    translate.value += clientX - currentPosX.value
  }
  currentPosX.value = clientX
}

const swipeSlide = (e: MouseEvent | TouchEvent) => {
  if (!props.draggable) return
  const { clientX } = e instanceof MouseEvent ? e : e.touches[0]
  const eventType = e instanceof MouseEvent ? 'mousemove' : 'touchmove'
  // console.log('swipeSlide', eventType)
  startTranslate.value = translate.value
  carouselWrapperTransition.value = 0
  startPosX.value = clientX
  currentPosX.value = clientX
  window.addEventListener(eventType, onMove, {
    passive: false
  })
}

const stopEvents = async (e: MouseEvent | TouchEvent) => {
  console.log('stop')
  if (!props.draggable) return
  carouselWrapperTransition.value = 3
  window.removeEventListener('mousemove', onMove)
  window.removeEventListener('touchmove', onMove)
  if (isMovable.value) {
    if (e instanceof MouseEvent) {
      e.preventDefault()
    }
    e.stopPropagation()
  }
  isMovable.value = false
  removeEventListener('mouseup', stopEvents)
}

const setCurrentSlide = (slideIndex: number) => {
  currentSlideIndex.value = slideIndex
  translate.value = -slideIndex * swipeTranslate.value
}

watch(isMovable, () => {
  if (isMovable.value) return
  setCurrentSlideIndex()
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

watch(
  () => props.slidesPerView,
  () => {
    translate.value = 0
    setCurrentSlideIndex()
  }
)

watch(
  () => props.autoplay,
  () => {
    if (props.autoplay) autoplay.start()
    else autoplay.stop()
  },
  {
    immediate: true
  }
)

const handleParentMouseEnter = () => {
  autoplay.stop()
}
const handleParentMouseLeave = () => {
  autoplay.start()
  addEventListener('mouseup', stopEvents)
}
const handleParentTouchStart = (e: MouseEvent | TouchEvent) => {
  swipeSlide(e)
  autoplay.stop()
}
const handleParentTouchEnd = (e: MouseEvent | TouchEvent) => {
  stopEvents(e)
  autoplay.start()
}

onUnmounted(() => {
  window.removeEventListener('mousemove', onMove)
  window.removeEventListener('touchmove', onMove)
})
</script>

<template>
  <div
    ref="carouselRef"
    class="carousel"
    @mousedown.prevent.left="swipeSlide"
    @click.capture="stopEvents"
    @touchstart="handleParentTouchStart"
    @touchend="handleParentTouchEnd"
    @mouseenter="handleParentMouseEnter"
    @mouseleave="handleParentMouseLeave"
  >
    <div class="carousel__wrapper" :style="carouselWrapperCss">
      <slot />
    </div>

    <div v-if="showDots" class="dots">
      <div
        v-for="(_, i) in countSlides"
        :key="i"
        :class="[{ active: i === currentSlideIndex }, dotType]"
        @click="setCurrentSlide(i)"
        @mousedown.stop
        @touchstart.stop.passive
      />
    </div>

    <template v-for="direction in (['prev', 'next'] as const)" :key="direction">
      <ArrowSvg
        v-show="showArrows"
        class="action"
        :class="{ hover: showArrows === 'hover', [direction]: true }"
        @click="swipeSlideByClick(direction)"
        @touchend.prevent.stop="swipeSlideByClick(direction)"
        @touchstart.stop.passive
        @mousedown.stop
      />
    </template>
  </div>
</template>

<style lang="sass">
$actionBtnsWidth: 40px

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
    top: calc( 50% - $actionBtnsWidth / 2 )
    cursor: pointer
    width: $actionBtnsWidth
    background: #fff
    border-radius: 50px
    padding: 10px
    transition: .2s
    fill: #8c8c8c
    box-shadow: 0 4px 10px #0000001a
    user-select: none
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
  .dots
    position: absolute
    bottom: 20px
    width: 100%
    display: flex
    justify-content: center
    gap: 4px
    user-select: none
    .line
      background-color: rgba(255, 255, 255, .3)
      border-radius: 4px
      cursor: pointer
      height: 4px
      transition: width .3s,background-color .3s cubic-bezier(.4,0,.2,1)
      width: 12px
      &.active
        width: 40px
        background: #fff
    .dot
      height: 8px
      width: 8px
      background-color: rgba(255, 255, 255, .3)
      border-radius: 50%
      cursor: pointer
      transition: width .3s,background-color .3s cubic-bezier(.4,0,.2,1)
      &.active
        background-color: #fff
</style>
