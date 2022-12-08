<script setup lang="ts">
import type { PropType } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    required: true,
  },
  type: {
    type: String as PropType<'text' | 'number'>,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: true,
  },
  step: {
    type: Number as PropType<number | undefined>,
    default: undefined,
  },
  min: {
    type: Number as PropType<number | undefined>,
    default: undefined,
  },
  max: {
    type: Number as PropType<number | undefined>,
    default: undefined,
  },
})

const emit = defineEmits(['update:modelValue'])

const onChange = (e: Event) => {
  if (e.target instanceof HTMLInputElement) {
    const value: number | string =
      props.type === 'number' ? Number(e.target.value) : e.target.value
    emit('update:modelValue', value)
  }
}
</script>

<template>
  <div>
    <span class="wrapper">
      <input
        :value="modelValue"
        :type="type"
        class="input"
        :placeholder="placeholder"
        :required="required"
        :step="step"
        :min="min"
        :max="max"
        @input="onChange"
      />
    </span>
  </div>
</template>

<style scoped lang="sass">
@import '@/styles/input.sass'
</style>
