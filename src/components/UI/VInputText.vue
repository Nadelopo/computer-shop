<script setup lang="ts">
import { onMounted, ref, type PropType } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    required: true,
  },
  type: {
    type: <PropType<'text' | 'number'>>String,
    default: 'text',
  },
  required: {
    type: Boolean,
    default: true,
  },
  autofocus: {
    type: Boolean,
    default: false,
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

const inputRef = ref<HTMLInputElement | null>(null)

onMounted(() => {
  if (props.autofocus) {
    inputRef.value?.focus()
  }
})
</script>

<template>
  <div>
    <span class="wrapper">
      <input
        v-bind="$attrs"
        ref="inputRef"
        :value="modelValue"
        :type="type"
        class="input"
        :required="required"
        @input="onChange"
      />
    </span>
  </div>
</template>

<style scoped lang="sass">
@import '@/styles/input.sass'
</style>
