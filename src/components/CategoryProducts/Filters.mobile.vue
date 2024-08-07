<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import Filters from './Filters.vue'
import type { Loading } from '@/types'

defineProps<{
  loadingProperties: Loading
}>()

defineEmits<{
  close: []
}>()

onMounted(() => {
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.body.style.overflow = 'visible'
})
</script>

<template>
  <div
    class="wrapper"
    @click="$emit('close')"
  >
    <div
      class="sidebar"
      @click.stop
    >
      <button
        type="button"
        class="w-16"
        @click="$emit('close')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="icon icon-tabler icon-tabler-arrow-narrow-left"
          width="100%"
          height="40"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="#26a69a"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            stroke="none"
            d="M0 0h24v24H0z"
            fill="none"
          />
          <path d="M5 12l14 0" />
          <path d="M5 12l4 4" />
          <path d="M5 12l4 -4" />
        </svg>
      </button>
      <Filters
        :loading-properties="loadingProperties"
        type="mobile"
        @apply="$emit('close')"
      />
    </div>
  </div>
</template>

<style scoped lang="sass">
.wrapper
  z-index: 101
  width: 100%
  position: fixed
  height: 100%
  top: 0
  bottom: 0
  left: 0
  right: 0
  backdrop-filter: brightness(0.4)
  .sidebar
    position: absolute
    background: #fff
    width: 100vw
    max-width: 400px
    top: 0
    right: 0
    height: 100%
    overflow-y: auto

.sidebar-enter-active,
.sidebar-leave-active
  transition: .4s ease

.sidebar-enter-from,
.sidebar-leave-to
  width: calc( 100% + 320px)
  transition: .4s ease
  opacity: 0
</style>
