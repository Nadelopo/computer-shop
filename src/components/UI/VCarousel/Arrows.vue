<script setup lang="ts">
import { nextTick } from 'vue'
import { ArrowSvg } from '@/assets/icons'

const props = defineProps<{
  translate: number
  lastTranslate: number
  swipeTranslate: number
  showArrows: boolean | 'hover'
}>()

const emit = defineEmits<{
  'update:translate': [number]
  setCurrentSlideIndex: []
}>()

const swipeSlideByClick = async (direction: 'next' | 'prev') => {
  let translate = 0
  try {
    let newTranslate = 0
    if (direction === 'next') {
      const isLastElement = -props.translate === props.lastTranslate
      if (isLastElement) return

      newTranslate = props.translate - props.swipeTranslate
      if (props.lastTranslate <= -newTranslate) {
        translate = -props.lastTranslate
        return
      }
    }
    if (direction === 'prev') {
      const isFirstElement = props.translate === 0
      if (isFirstElement) {
        translate = -props.lastTranslate
        return
      }
      newTranslate = props.translate + props.swipeTranslate
      if (newTranslate >= 0) {
        translate = 0
        return
      }
    }
    translate = newTranslate
  } finally {
    emit('update:translate', translate)
    await nextTick()
    emit('setCurrentSlideIndex')
  }
}
defineExpose({ swipeSlideByClick })
</script>

<template>
  <template
    v-for="arrowDirection in ['prev', 'next'] as const"
    :key="arrowDirection"
  >
    <arrow-svg
      v-show="showArrows"
      class="action"
      :class="{ hover: showArrows === 'hover', [arrowDirection]: true }"
      @click="swipeSlideByClick(arrowDirection)"
      @touchend.prevent.stop="swipeSlideByClick(arrowDirection)"
      @touchstart.stop.passive
      @mousedown.stop
    />
  </template>
</template>

<style scoped lang="sass">
$actionBtnsWidth: 40px

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
    background: var(--main)
    fill: #fff
  &.next
    rotate: 90deg
    right: 10px
  &.prev
    left: 10px
    rotate: -90deg
</style>
