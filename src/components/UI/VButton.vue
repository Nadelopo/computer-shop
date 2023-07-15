<script setup lang="ts">
type Props = {
  minWidth?: number | 'auto'
  variant?: 'primary' | 'danger' | 'noactive'
  width?: number | 'auto'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  width: 'auto'
})

let minWidth = '100px'
let width = 'auto'

if (props.width === 'auto') {
  width = 'auto'
} else {
  width = props.width + 'px'
}

if (props.minWidth) {
  if (props.minWidth == 'auto') {
    minWidth = 'auto'
  } else {
    minWidth = props.minWidth + 'px'
  }
}
</script>

<template>
  <button
    v-wave
    class="btn"
    :class="{
      danger: variant === 'danger',
      noactive: variant === 'noactive'
    }"
  >
    <slot></slot>
  </button>
</template>

<style scoped lang="sass">
@import '@/styles/buttons'
.btn
  min-width: v-bind(minWidth)
  width: v-bind(width)
</style>
