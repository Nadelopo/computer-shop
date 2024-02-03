<script setup lang="ts" generic="T extends string | number">
import { computed, onMounted, ref, useAttrs } from 'vue'
import { vMaska } from 'maska'
import { debounce } from '@/utils/debounce'

type Props = {
  modelValue: T
  type?: 'text' | 'number' | 'phone'
  required?: boolean
  autofocus?: boolean
  id?: string
  showSpinButtons?: boolean
  max?: number | string
  min?: number | string
  debounce?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: true,
  autofocus: false,
  showSpinButtons: true,
  max: Infinity,
  min: -Infinity,
  debounce: 0
})

const emit = defineEmits<{
  'update:modelValue': [T]
}>()

defineOptions({
  inheritAttrs: false
})

const onInput = debounce((e: Event) => {
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
}, props.debounce)

const inputRef = ref<HTMLInputElement | null>(null)
onMounted(() => {
  if (props.autofocus) {
    inputRef.value?.focus()
  }
})

const attrs = useAttrs()
const bindOptions = computed(() => {
  const options = { ...attrs }
  if (props.type === 'phone') {
    options['data-maska'] = '7 (###) ###-##-##'
  }
  return options
})
</script>

<template>
  <div>
    <span class="wrapper">
      <input
        :id="id"
        ref="inputRef"
        v-maska
        :value="modelValue"
        :type="type"
        :max="max"
        :min="min"
        class="input"
        :class="{ hidden__spin__buttons: !showSpinButtons }"
        :required="required"
        v-bind="bindOptions"
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
  background: initial
  &.hidden__spin__buttons
    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button
      -webkit-appearance: none
      margin: 0
  &:disabled
    opacity: .5
</style>
