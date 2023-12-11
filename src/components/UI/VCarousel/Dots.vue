<script setup lang="ts">
import { nextTick, ref } from 'vue'

const props = defineProps<{
  translate: number
  lastTranslate: number
  swipeTranslate: number
  countSlides: number
  showDots: boolean | 'dot' | 'line'
}>()

const emit = defineEmits<{
  'update:translate': [number]
}>()

const currentSlideIndex = ref(0)

const setCurrentSlideIndex = async () => {
  if (props.translate >= 0) {
    currentSlideIndex.value = 0
    return
  }
  if (props.translate <= -props.lastTranslate) {
    currentSlideIndex.value = props.countSlides - 1
    return
  }
  await nextTick()
  currentSlideIndex.value = Math.ceil(-props.translate / props.swipeTranslate)
}

const setCurrentSlide = (slideIndex: number) => {
  currentSlideIndex.value = slideIndex
  emit('update:translate', -slideIndex * props.swipeTranslate)
}

defineExpose({ setCurrentSlideIndex })
</script>

<template>
  <div
    v-if="showDots"
    class="dots"
  >
    <div
      v-for="(_, i) in countSlides"
      :key="i"
      :class="[
        { active: i === currentSlideIndex },
        showDots === true ? 'line' : showDots
      ]"
      @click="setCurrentSlide(i)"
      @mousedown.stop
      @touchstart.stop.passive
    />
  </div>
</template>

<style scoped lang="sass">
.dots
  position: absolute
  bottom: 20px
  width: 100%
  display: flex
  justify-content: center
  gap: 4px
  user-select: none
  .line
    background-color: rgba(0, 0, 0, .1)
    border-radius: 4px
    cursor: pointer
    height: 4px
    transition: width .3s,background-color .3s cubic-bezier(.4,0,.2,1)
    width: 12px
    &.active
      width: 40px
      background-color: var(--color-text)
  .dot
    height: 8px
    width: 8px
    background-color: rgba(0, 0, 0, .1)
    border-radius: 50%
    cursor: pointer
    transition: width .3s,background-color .3s cubic-bezier(.4,0,.2,1)
    &.active
      background-color: var(--color-text)
</style>
