<script setup lang="ts">
import { onUnmounted, watch } from 'vue'

defineProps<{
  fullScreen?: boolean
}>()

defineOptions({
  inheritAttrs: false
})

const modelValue = defineModel<boolean>({ required: true })

watch(modelValue, () => {
  if (modelValue.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = 'visible'
  }
})

onUnmounted(() => {
  document.body.style.overflow = 'visible'
})
</script>

<template>
  <Teleport to="body">
    <transition-group name="fade">
      <div
        v-if="modelValue"
        class="dialog"
        :class="{ full__screen: fullScreen }"
        @mousedown.stop="modelValue = false"
      >
        <div
          class="dialog__content"
          v-bind="$attrs"
          @mousedown.stop
        >
          <slot />
        </div>
      </div>
    </transition-group>
  </Teleport>
</template>

<style scoped lang="sass">
.dialog
  top: 0
  bottom: 0
  right: 0
  left: 0
  background: rgba(0, 0, 0, 0.5)
  position: fixed
  display: flex
  z-index: 1000
  padding: 10px
  overflow: auto
  &.full__screen
    padding: 0
    .dialog__content
      border-radius: 0
      width: 100%
      height: 100%

.dialog__content
  margin: auto
  background: white
  border-radius: 8px
  min-height: 50px
  min-width: 300px

.fade-enter-active,
.fade-leave-active
  transition: opacity 0.3s ease

.fade-enter-from,
.fade-leave-to
  opacity: 0
</style>
