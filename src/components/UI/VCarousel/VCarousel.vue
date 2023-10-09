<script setup lang="ts">
import { computed, onMounted, ref, watch, watchEffect } from 'vue'
import { useElementSize, useMutationObserver } from '@vueuse/core'
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
  slidePosition?: 'start' | 'center' | 'end'
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
  breakpoints: () => ({}),
  slidePosition: 'center'
})

const slidesPerView = ref(props.slidesPerView)
const spaceBetween = ref(props.spaceBetween)
const { breakpoints } = useBreakpoints(props.breakpoints, {
  slidesPerView: {
    ref: slidesPerView,
    default: props.slidesPerView
  },
  spaceBetween: {
    ref: spaceBetween,
    default: props.spaceBetween
  }
})

const translate = ref(0)

const carouselRef = ref<HTMLElement>()
const { width: carouselWidth } = useElementSize(carouselRef)
const slideWidth = computed((): string => {
  const carouselWidthValue =
    carouselWidth.value - spaceBetween.value * (slidesPerView.value - 1)
  return carouselWidthValue / slidesPerView.value + 'px'
})
const countItems = ref(0)
const carouselSlidesRef = ref<HTMLElement>()
useMutationObserver(
  carouselSlidesRef,
  () => {
    countItems.value = carouselRef.value?.children[0].children.length ?? 0
  },
  {
    childList: true
  }
)
onMounted(() => {
  countItems.value = carouselRef.value?.children[0].children.length ?? 0
})
const notMovable = computed(() => countItems.value <= props.slidesPerView)
const lastTranslate = computed((): number => {
  if (!carouselRef.value) return 0
  const countOffsetItems = countItems.value - slidesPerView.value
  return (
    countOffsetItems * parseInt(slideWidth.value) +
    countOffsetItems * spaceBetween.value
  )
})

const carouselWrapperTransition = ref(3)
const carouselWrapperCss = computed(() => {
  const translateDirection =
    props.direction === 'horizontal' ? 'translateX' : 'translateY'
  return `
    gap: ${spaceBetween.value}px;
    transform: ${translateDirection}(${translate.value}px);
    transition: .${carouselWrapperTransition.value}s;
  `
})

const currentPosX = ref(0)
const startPosX = ref(0)
const touchMoveDirection = ref<'vertical' | 'horizontal' | null>(null)
const isMovableOnEvents = ref(false)
const onMove = (e: MouseEvent | TouchEvent) => {
  const { clientX } = e instanceof MouseEvent ? e : e.touches[0]
  if (e instanceof MouseEvent) {
    touchMoveDirection.value = null
  } else if (e instanceof TouchEvent && !isMovableOnEvents.value) {
    touchMoveDirection.value =
      Math.abs(clientX - startPosX.value) > 4 ? 'horizontal' : 'vertical'
  }
  isMovableOnEvents.value = true
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
  if (!props.draggable || notMovable.value) return
  const { clientX } = e instanceof MouseEvent ? e : e.touches[0]
  const eventType = e instanceof MouseEvent ? 'mousemove' : 'touchmove'
  startTranslate.value = translate.value
  carouselWrapperTransition.value = 0
  startPosX.value = clientX
  currentPosX.value = clientX
  moveListener.add(eventType)
}

const stopEvents = async (e: MouseEvent | TouchEvent) => {
  if (!props.draggable || notMovable.value) return
  carouselWrapperTransition.value = 3
  moveListener.remove()
  if (isMovableOnEvents.value) {
    if (e instanceof MouseEvent) {
      e.preventDefault()
    }
    e.stopPropagation()
  }
  isMovableOnEvents.value = false
  mouseUpListener.remove()
}
const mouseUpListener = useMouseUpListener(stopEvents)

const dotsRef = ref<{ setCurrentSlideIndex: () => void }>()
const swipeTranslate = computed(() => {
  return (
    (parseInt(slideWidth.value) + spaceBetween.value) *
      props.countSwipeSlides || 1
  )
})
watch(isMovableOnEvents, () => {
  if (isMovableOnEvents.value) return
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
  [() => props.slidesPerView, breakpoints],
  () => {
    slidesPerView.value = props.slidesPerView
    translate.value = 0
    dotsRef.value?.setCurrentSlideIndex()
  },
  {
    deep: true
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
      arrowRef.value?.swipeSlideByClick('next')
    }, timeInterval)
  }
}
watchEffect(() => {
  if (props.autoplay) autoplay.start()
  else autoplay.stop()
})

const handleParentMouseEnter = () => {
  if (notMovable.value) return
  autoplay.stop()
  mouseUpListener.remove()
}
const handleParentMouseLeave = () => {
  if (notMovable.value) return
  autoplay.start()
  mouseUpListener.add()
}
const handleParentTouchStart = (e: MouseEvent | TouchEvent) => {
  if (notMovable.value) return
  swipeSlide(e)
  autoplay.stop()
}
const handleParentTouchEnd = (e: MouseEvent | TouchEvent) => {
  if (notMovable.value) return
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
    @mousedown.left.prevent="swipeSlide"
    @click.capture.left="stopEvents"
    @touchstart="handleParentTouchStart"
    @touchend="handleParentTouchEnd"
    @mouseenter="handleParentMouseEnter"
    @mouseleave="handleParentMouseLeave"
  >
    <div
      ref="carouselSlidesRef"
      class="carousel__slides"
      :style="carouselWrapperCss"
    >
      <slot />
    </div>
    <template v-if="!notMovable">
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
    </template>
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
  :slotted(.carousel__slide)
    display: flex
    justify-content: v-bind('props.slidePosition')
</style>
