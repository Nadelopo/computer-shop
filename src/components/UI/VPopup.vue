<script setup lang="ts">
import { ref, watch } from 'vue'
import { onClickOutsideClose } from '@/utils/onClickOutsideClose'

type Props = {
  type?: 'click' | 'hover'
  minWidth?: string
  float?: 'start' | 'end' | 'center'
  isCloseOnClick?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'click',
  minWidth: 'auto',
  isCloseOnClick: true
})

const left = ref('0')

const activeRef = ref<HTMLElement>()
const contentRef = ref<HTMLElement>()
const rootRef = ref<HTMLElement>()
const isOpen = onClickOutsideClose(rootRef)
let timeout = 0

watch(
  contentRef,
  () => {
    if (!activeRef.value || !contentRef.value) return
    const activeWidth = activeRef.value.scrollWidth
    const contentWidth = contentRef.value.scrollWidth
    if (props.float === 'start') {
      left.value = `-${contentWidth - activeWidth}px`
    } else if (props.float === 'center') {
      left.value = `-${contentWidth / 2 - activeWidth / 2}px`
    }
  },
  { once: true }
)
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
  <div
    ref="rootRef"
    class="popup__rootasd32bs34"
  >
    <div
      ref="activeRef"
      v-on="
        props.type === 'click'
          ? { click: () => (isOpen = !isOpen) }
          : {
              mouseenter: onEnter,
              mouseleave: onLeave,
              click: () => (isOpen = !isOpen)
            }
      "
    >
      <slot
        name="active"
        class="popup__slotdgh345c"
      />
    </div>
    <transition name="popup__animation">
      <div
        v-if="isOpen"
        ref="contentRef"
        class="popup__contentlksdn553"
        @click="isCloseOnClick && (isOpen = false)"
        v-on="
          props.type === 'hover'
            ? { mouseenter: contentEnter, mouseleave: onLeave }
            : {}
        "
      >
        <slot name="content" />
      </div>
    </transition>
  </div>
</template>

<style scoped lang="sass">
.popup__rootasd32bs34
  position: relative
  .popup__contentlksdn553
    min-width: v-bind(minWidth)
    width: max-content
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
    :slotted(.popup__el)
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
        background: var(--main)

.popup__animation-enter-active,
.popup__animation-leave-active
  transition: transform .2s, opacity .2s

.popup__animation-enter-from,
.popup__animation-leave-to
  opacity: 0
  transform: scale(0.6)
</style>
