<script lang="ts" setup>
import { type InputHTMLAttributes } from 'vue'

defineProps<{
  modelValue?: string
  inputAttributes?: InputHTMLAttributes
  title?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target) {
    emit('update:modelValue', target.value)
  }
}
</script>

<template>
  <div>
    <p class="window-title">{{ title }}</p>
    <input
      v-bind="inputAttributes"
      :value="modelValue"
      class="app-input"
      @input="handleInput"
    />
    <div class="app-input-error">
      <ErrorIcon class="app-input-error__icon" />
      <div class="app-input-error__text">
        <slot></slot>
      </div>
    </div>
  </div>
</template>
