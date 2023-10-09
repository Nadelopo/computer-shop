<script setup lang="ts">
import { computed, ref, watch, watchEffect } from 'vue'
import { useElementSize } from '@vueuse/core'
import { useMouseUpListener, useMoveListener } from './useListeners'
import { useBreakpoints, type PropsBreakpoints } from './useBreakpoints'
import Arrows from './Arrows.vue'
import Dots from './Dots.vue'

type Props = {
  slidesPerView?: number
  countSwipeSlides?: number
  spaceBetween?: number
  draggable?: boolean
  showArrows?: boolean | 'hover'
  showDots?: boolean
  dotType?: 'dot' | 'line'
  autoplay?: boolean | number
  direction?: 'vertical' | 'horizontal'
  breakpoints?: PropsBreakpoints
}

const props = withDefaults(defineProps<Props>(), {
  slidesPerView: 1,
  spaceBetween: 0,
  countSwipeSlides: 1,
  draggable: false,
  showArrows: false,
  showDots: false,
  dotType: 'line',
  autoplay: false,
  direction: 'horizontal',
  breakpoints: () => ({})
})

const slidesPerView = ref(props.slidesPerView)
useBreakpoints(props.breakpoints, slidesPerView, props.slidesPerView)

const translate = ref(0)

const carouselRef = ref<HTMLElement>()
const { width: carouselWidth } = useElementSize(carouselRef)
const slideWidth = computed(() => {
  const carouselWidthValue =
    carouselWidth.value - props.spaceBetween * (slidesPerView.value - 1)
  return carouselWidthValue / slidesPerView.value + 'px'
})
const lastTranslate = computed(() => {
  if (!carouselRef.value) return 0
  const countItems =
    carouselRef.value.children[0].children.length - slidesPerView.value
  return (
    countItems * parseInt(slideWidth.value) + countItems * props.spaceBetween
  )
})

const carouselWrapperTransition = ref(3)
const carouselWrapperCss = computed(() => {
  const translateDirection =
    props.direction === 'horizontal' ? 'translateX' : 'translateY'
  return `
    gap: ${props.spaceBetween}px;
    transform: ${translateDirection}(${translate.value}px);
    transition: .${carouselWrapperTransition.value}s;
  `
})

const currentPosX = ref(0)
const startPosX = ref(0)
const touchMoveDirection = ref<'vertical' | 'horizontal' | null>(null)
const isMovable = ref(false)
const onMove = (e: MouseEvent | TouchEvent) => {
  console.log('move')

  const { clientX } = e instanceof MouseEvent ? e : e.touches[0]

  if (e instanceof MouseEvent) {
    touchMoveDirection.value = null
  } else if (e instanceof TouchEvent && !isMovable.value) {
    touchMoveDirection.value =
      Math.abs(clientX - startPosX.value) > 4 ? 'horizontal' : 'vertical'
  }

  isMovable.value = true
  if (touchMoveDirection.value === 'vertical') return
  if (touchMoveDirection.value === 'horizontal') e.preventDefault()
  const currentPosXValue = currentPosX.value
  if (clientX > currentPosXValue || clientX < currentPosXValue) {
    translate.value += clientX - currentPosXValue
  }
  currentPosX.value = clientX
}

const moveListener = useMoveListener(onMove)

const startTranslate = ref(0)
const swipeSlide = (e: MouseEvent | TouchEvent) => {
  if (!props.draggable) return
  const { clientX } = e instanceof MouseEvent ? e : e.touches[0]
  const eventType = e instanceof MouseEvent ? 'mousemove' : 'touchmove'
  console.log('swipeSlide', eventType)
  startTranslate.value = translate.value
  carouselWrapperTransition.value = 0
  startPosX.value = clientX
  currentPosX.value = clientX
  moveListener.add(eventType)
}

const stopEvents = async (e: MouseEvent | TouchEvent) => {
  console.log('stop')
  if (!props.draggable) return
  carouselWrapperTransition.value = 3
  moveListener.remove()
  if (isMovable.value) {
    if (e instanceof MouseEvent) {
      e.preventDefault()
    }
    e.stopPropagation()
  }
  isMovable.value = false
  mouseUpListener.remove()
}
const mouseUpListener = useMouseUpListener(stopEvents)

const dotsRef = ref<{ setCurrentSlideIndex: () => void }>()
const swipeTranslate = computed(() => {
  return (
    (parseInt(slideWidth.value) + props.spaceBetween) *
      props.countSwipeSlides || 1
  )
})
watch(isMovable, () => {
  if (isMovable.value) return
  dotsRef.value?.setCurrentSlideIndex()
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
    slidesPerView.value = props.slidesPerView
    translate.value = 0
    dotsRef.value?.setCurrentSlideIndex()
  }
)

const arrowRef = ref<{
  swipeSlideByClick: (direction: 'next' | 'prev') => void
}>()
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
      arrowRef.value?.swipeSlideByClick('next')
    }, timeInterval)
  }
}
watchEffect(() => {
  if (props.autoplay) autoplay.start()
  else autoplay.stop()
})

const handleParentMouseEnter = () => {
  autoplay.stop()
  mouseUpListener.remove()
}
const handleParentMouseLeave = () => {
  autoplay.start()
  mouseUpListener.add()
}
const handleParentTouchStart = (e: MouseEvent | TouchEvent) => {
  swipeSlide(e)
  autoplay.stop()
}
const handleParentTouchEnd = (e: MouseEvent | TouchEvent) => {
  stopEvents(e)
  autoplay.start()
}

const countSlides = computed(() => {
  return Math.ceil(lastTranslate.value / swipeTranslate.value) + 1
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
    <div class="carousel__slides" :style="carouselWrapperCss">
      <slot />
    </div>

    <Dots
      ref="dotsRef"
      v-model:translate="translate"
      :show-dots="showDots"
      :dot-type="dotType"
      :last-translate="lastTranslate"
      :swipe-translate="swipeTranslate"
      :count-slides="countSlides"
    />
    <Arrows
      ref="arrowRef"
      v-model:translate="translate"
      :show-arrows="showArrows"
      :last-translate="lastTranslate"
      :swipe-translate="swipeTranslate"
      @set-current-slide-index="dotsRef?.setCurrentSlideIndex()"
    />
  </div>
</template>

<style scoped lang="sass">

.carousel
  position: relative
  overflow: hidden
  &:hover
    :deep(.action.hover)
      opacity: 1
      &.prev
        left: 20px
      &.next
        right: 20px
  .carousel__container
    overflow: hidden
  .carousel__slides
    display: flex
    :slotted(.carousel__slide)
      min-width: v-bind(slideWidth)
</style>
