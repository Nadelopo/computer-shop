<script setup lang="ts">
import { watch } from 'vue'

const modelValue = defineModel<boolean>({ required: true })

watch(modelValue, () => {
  if (modelValue.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = 'visible'
  }
})
</script>

<template>
  <Teleport to="body">
    <transition-group name="fade">
      <div v-if="modelValue" class="dialog" @click.stop="modelValue = false">
        <div class="dialog__content" v-bind="$attrs" @click.stop>
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
