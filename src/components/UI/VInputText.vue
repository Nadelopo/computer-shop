<script setup lang="ts">
import { onMounted, ref } from 'vue'

type Props = {
  modelValue: string | number | undefined | null
  type?: 'text' | 'number'
  required?: boolean
  autofocus?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: true,
  autofocus: false
})

const emit = defineEmits<{
  'update:modelValue': [string | number]
}>()

defineOptions({
  inheritAttrs: false
})

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
  <div v-if="modelValue !== undefined || modelValue !== null">
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
.wrapper
  position: relative
  &::after
    content: ''
    width: 100%
    height: 2px
    position: absolute
    bottom: -6px
    left: 0
    background: var(--color-main)
    transition: 0.4s
    transform: scaleX(0)
  &:focus-within::after
    transform: scaleX(1)

.input
  outline: none
  width: 100%
  height: 30px
  border-bottom: 1px solid #9e9e9e
  transition: 0.4s
  background: initial
</style>
