<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    required: true,
  },
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String || null,
    default: null,
  },
  required: {
    type: Boolean,
    default: true,
  },
  step: {
    type: Number || null,
    default: null,
  },
  min: {
    type: Number || null,
    default: null,
  },
  max: {
    type: Number || null,
    default: null,
  },
})

defineEmits(['update:modelValue'])

const value = ref(props.modelValue)
watch(
  () => props.modelValue,
  (cur) => {
    if (!cur) {
      value.value = ''
    }
  }
)
</script>

<template>
  <div>
    <span class="wrapper">
      <input
        v-model="value"
        :type="type"
        class="input"
        :placeholder="placeholder"
        :required="required"
        :step="step"
        :min="min"
        :max="max"
        @input="$emit('update:modelValue', value)"
      />
    </span>
  </div>
</template>

<style scoped lang="sass">
@import '@/styles/input.sass'
</style>
