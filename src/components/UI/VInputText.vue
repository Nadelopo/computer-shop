<script setup lang="ts" generic="T extends string | number">
import { onMounted, ref } from 'vue'

type Props = {
  modelValue: T
  type?: 'text' | 'number'
  required?: boolean
  autofocus?: boolean
  id?: string
  showSpinButtons?: boolean
  max?: number | string
  min?: number | string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: true,
  autofocus: false,
  showSpinButtons: true,
  max: Infinity,
  min: -Infinity
})

const emit = defineEmits<{
  'update:modelValue': [T]
}>()

defineOptions({
  inheritAttrs: false
})

const onInput = (e: Event) => {
  const el = e.target as HTMLInputElement
  let value: number | string =
    props.type === 'number' ? Number(el.value) : el.value
  if (props.type === 'number') {
    if (el.value[0] === '0') {
      el.value = el.value.replace(/^0+/, '')
    }
    if (value > props.max) {
      el.value = String(props.max)
      value = props.max
    }
    if (value < props.min) {
      el.value = String(props.min)
      value = props.min
    }
  }
  emit('update:modelValue', value as T)
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
        :id="id"
        v-bind="$attrs"
        ref="inputRef"
        :value="modelValue"
        :type="type"
        :max="max"
        :min="min"
        class="input"
        :class="{ hidden__spin__buttons: !showSpinButtons }"
        :required="required"
        @input="onInput"
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
  // transition: 0.4s
  background: initial
  &.hidden__spin__buttons
    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button
      -webkit-appearance: none
      margin: 0
  &:disabled
    opacity: .5
</style>
