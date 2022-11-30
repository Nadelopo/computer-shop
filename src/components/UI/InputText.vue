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
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: true,
  },
})

defineEmits(['update:modelValue'])

const value = ref('')
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
        @input="$emit('update:modelValue', value)"
      />
    </span>
  </div>
</template>

<style scoped lang="sass">
@import '@/styles/input.sass'
</style>
