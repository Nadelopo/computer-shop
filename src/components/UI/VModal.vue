<script setup lang="ts">
import { nextTick, onUnmounted, ref, watch } from 'vue'
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap'

defineProps<{
  fullScreen?: boolean
}>()

defineOptions({
  inheritAttrs: false
})

const modelValue = defineModel<boolean>({ required: true })

const target = ref<HTMLElement>()
const { activate, deactivate } = useFocusTrap(target)

const tabindex = ref(0)
watch(modelValue, async (value) => {
  if (value) {
    document.body.style.overflow = 'hidden'
    await nextTick()
    activate()
    tabindex.value = -1
  } else {
    document.body.style.overflow = 'visible'
    await nextTick()
    deactivate()
    tabindex.value = 0
  }
})

onUnmounted(() => {
  document.body.style.overflow = 'visible'
  deactivate()
})
</script>

<template>
  <Teleport to="body">
    <transition-group name="fade">
      <div
        v-if="modelValue"
        ref="target"
        class="dialog"
        :class="{ full__screen: fullScreen }"
        @mousedown.stop="modelValue = false"
      >
        <div
          class="dialog__content"
          v-bind="$attrs"
          :tabindex
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
  outline: none

.fade-enter-active,
.fade-leave-active
  transition: opacity 0.3s ease

.fade-enter-from,
.fade-leave-to
  opacity: 0
</style>
