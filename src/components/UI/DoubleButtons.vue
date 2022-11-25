<script setup lang="ts">
defineProps({
  textFirst: {
    type: String,
    default: 'true',
  },
  textSecond: {
    type: String,
    default: 'false',
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
      type="button"
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
