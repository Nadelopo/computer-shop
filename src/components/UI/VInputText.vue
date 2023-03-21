<script setup lang="ts">
import { onMounted, ref } from 'vue'

type Props = {
  modelValue: string | number | undefined
  type?: 'text' | 'number'
  required?: boolean
  autofocus?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: true,
  autofocus: false
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
  <div v-if="modelValue !== undefined">
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
