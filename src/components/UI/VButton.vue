<script setup lang="ts">
const props = defineProps<{
  minWidth?: number | 'auto'
}>()
let minWidth = '200px'
if (props.minWidth === 'auto') {
  minWidth = 'auto'
} else if (props.minWidth) {
  minWidth = props.minWidth + 'px'
} else {
  minWidth = '100px'
}
</script>

<template>
  <button v-wave class="btn"><slot></slot></button>
</template>

<style scoped lang="sass">
@import '@/styles/buttons'
.btn
  min-width: v-bind(minWidth)
</style>
