<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { onClickOutsideClose } from '@/utils/onClickOutsideClose'

type Props = {
  type?: 'click' | 'hover'
  width?: string
  float?: 'start' | 'end' | 'center'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'click'
})

const minWidth = props.width ?? '100px'
let left = ref('0')

const activeRef = ref()
const isOpen = onClickOutsideClose(activeRef)
let timeout = 0

onMounted(() => {
  const activeWidth = activeRef.value.scrollWidth
  if (props.float === 'start') {
    left.value = `-${parseInt(minWidth) - activeWidth}px`
  } else if (props.float === 'center') {
    left.value = `-${parseInt(minWidth) / 2 - activeWidth / 2}px`
  }
})
const onEnter = () => {
  if (props.type === 'hover') {
    clearTimeout(timeout)
    timeout = window.setTimeout(() => {
      isOpen.value = true
    }, 100)
  }
}

const onLeave = () => {
  if (props.type === 'hover') {
    clearTimeout(timeout)
    timeout = window.setTimeout(() => {
      isOpen.value = false
    }, 300)
  }
}

const contentEnter = () => {
  if (!isOpen.value) return
  if (props.type === 'hover') {
    onEnter()
  }
}
</script>

<template>
  <div class="popup__rootasd32bs34">
    <div
      ref="activeRef"
      @click="isOpen = !isOpen"
      @mouseenter="onEnter"
      @mouseleave="onLeave"
    >
      <slot
        name="active"
        class="popup__slotdgh345c"
      />
    </div>
    <transition name="popup__animation">
      <div
        v-if="isOpen"
        class="popup__contentlksdn553"
        @mouseenter="contentEnter"
        @mouseleave="onLeave"
      >
        <slot name="content"></slot>
      </div>
    </transition>
  </div>
</template>

<style lang="sass">
.popup__rootasd32bs34
  position: relative
  .popup__slotdgh345c
    position: absolute
  .popup__contentlksdn553
    min-width: v-bind(minWidth)
    top: 35px
    position: absolute
    background: #fff
    padding: 4px
    box-shadow: 0 0 6px 4px rgba(0,0,0, .15)
    border-radius: 4px
    color: #000
    z-index: 100
    max-height: 150px
    overflow: auto
    left: v-bind(left)
    &::-webkit-scrollbar
      width: 4px
    &::-webkit-scrollbar-thumb
      background: #888
      border-radius: 80px
    div, a
      min-width: 100%
      font-size: 18px
      display: flex
      user-select: none
      border-radius: 4px
      transition: .2s
      padding: 0 4px
      cursor: pointer
      &:hover
        color: #fff
        background: var(--color-main)

.popup__animation-enter-active,
.popup__animation-leave-active
  transition:  0.2s


.popup__animation-enter-from,
.popup__animation-leave-to
  opacity: 0
  transform: scale(0.6)
</style>
