<script setup lang="ts">
import { ref } from 'vue'
import { onClickOutsideClose } from '@/utils/onClickOutsideClose'

const activeRef = ref()
const isOpen = onClickOutsideClose(activeRef)
</script>

<template>
  <div class="popup__rootasd32bs34">
    <div ref="activeRef" @click="isOpen = !isOpen">
      <slot name="active" class="popup__slotdgh345c"></slot>
    </div>
    <transition name="popup__animation">
      <div v-if="isOpen" class="popup__contentlksdn553">
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
    top: 35px
    position: absolute
    background: #fff
    padding: 4px
    box-shadow: 0 0 6px 4px rgba(0,0,0, .15)
    border-radius: 4px
    color: #000
    div, a
      min-width: 100px
      font-size: 18px
      display: block
      user-select: none
      border-radius: 4px
      transition: .2s
      padding: 0 4px
      cursor: pointer
      text-align: start!important
      &:hover
        color: #fff
        background: var(--color-main)

.popup__animation-enter-active,
.popup__animation-leave-active
  transition:  0.2s


.popup__animation-enter-from,
.popup__animation-leave-to
  opacity: 0
</style>
