<script setup lang="ts">
import { ref, watchEffect } from 'vue'

type Props = {
  visibility: boolean
  transition?: number
}

const props = withDefaults(defineProps<Props>(), {
  transition: 0.2
})

const parent = ref<HTMLElement>()
const height = ref(props.visibility ? 'auto' : '0')
watchEffect(async () => {
  if (!parent.value) return
  if (props.visibility) {
    height.value = parent.value.scrollHeight + 'px'
    setTimeout(() => {
      if (props.visibility) {
        height.value = 'auto'
      }
    }, props.transition * 1000)
  } else {
    height.value = parent.value.scrollHeight + 'px'
    setTimeout(() => {
      height.value = '0'
    })
  }
})

const transition = props.transition + 's'
</script>

<template>
  <div
    ref="parent"
    class="accordion"
    :class="{ active: visibility }"
  >
    <slot></slot>
  </div>
</template>

<style scoped lang="sass">

.accordion
  visibility: hidden
  opacity: 0.2
  transition: v-bind(transition)
  overflow: hidden
  height: v-bind(height)
  & > div, & > button, & > a
    display: block
    transition: v-bind(transition)
  &.active
    visibility: visible
    opacity: 1
</style>
