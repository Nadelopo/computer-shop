<script setup lang="ts">
import type { PropType } from 'vue'

defineProps({
  textFirst: {
    type: String,
    default: 'true',
  },
  textSecond: {
    type: String,
    default: 'false',
  },
  type: {
    type: String as PropType<'button' | 'submit' | 'reset' | undefined>,
    default: 'button',
  },
  modelValue: Boolean,
})
defineEmits(['update:modelValue'])
</script>

<template>
  <div class="wrap">
    <button
      type="button"
      :class="modelValue ? 'btn' : 'btn__noactive'"
      @click="$emit('update:modelValue', true)"
    >
      {{ textFirst }}
    </button>
    <button
      :type="type"
      class="btn"
      :class="!modelValue ? 'btn' : 'btn__noactive'"
      @click="$emit('update:modelValue', false)"
    >
      {{ textSecond }}
    </button>
  </div>
</template>

<style scoped lang="sass">

.wrap
  display: flex
  gap: 10px
</style>
