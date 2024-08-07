<script setup lang="ts" generic="T extends string | number">
import {
  computed,
  onMounted,
  ref,
  useAttrs,
  type InputHTMLAttributes
} from 'vue'
import { vMaska, MaskaDetail } from 'maska'
import { debounce as Debounce } from '@/utils/debounce'
import { CrossSvg, SearchSvg } from '@/assets/icons'

export interface VInputTextProps<T = string>
  extends /* @vue-ignore */ InputHTMLAttributes {
  modelValue: T | null
  type?: 'text' | 'number' | 'tel'
  autofocus?: boolean
  id?: string
  min?: number | string
  max?: number | string
  required?: boolean
  showSpinButtons?: boolean
  debounce?: number
  error?: boolean
  onSearch?: any
  onClear?: any
  textPlacement?: 'start' | 'center' | 'end'
}

const props = withDefaults(defineProps<VInputTextProps<T>>(), {
  type: 'text',
  autofocus: false,
  showSpinButtons: true,
  max: Infinity,
  min: -Infinity,
  required: true
})

const emit = defineEmits<{
  'update:modelValue': [model: T, MaskaDetail?: MaskaDetail]
  search: []
  clear: []
}>()

defineOptions({
  inheritAttrs: false
})

const maskaDetails = ref<MaskaDetail>({
  completed: false,
  masked: '',
  unmasked: ''
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
  if (props.type === 'tel') {
    emit('update:modelValue', value as T, maskaDetails.value)
    return
  }
  emit('update:modelValue', value as T)
}

const inputRef = ref<HTMLInputElement | null>(null)
onMounted(() => {
  if (props.autofocus) {
    inputRef.value?.focus()
  }
})

const chooseOnInputFunc = computed(() =>
  props.debounce ? Debounce(onInput, props.debounce) : onInput
)

const attrs = useAttrs()
const bindOptions = computed(() => ({
  ...attrs,
  class: [
    'input',
    { hidden__spin__buttons: !props.showSpinButtons },
    props.textPlacement && `text-${props.textPlacement}`
  ],
  id: props.id,
  ref: inputRef,
  value: props.modelValue,
  type: props.type,
  max: props.max,
  min: props.min,
  required: props.required
}))

defineExpose({ ref: inputRef })

const showClearButton = computed(() => {
  if (!props.onClear) return
  if (typeof props.modelValue === 'string') {
    return props.modelValue.length > 0
  }
  if (typeof props.modelValue === 'number') {
    return props.modelValue > 0
  }
  return false
})
</script>

<template>
  <div
    class="wrapper"
    :class="[{ error }, attrs.class]"
  >
    <input
      v-if="type === 'tel'"
      v-maska="maskaDetails"
      data-maska="7 (###) ### ##-##"
      v-bind="bindOptions"
      @input="chooseOnInputFunc"
    />
    <input
      v-else
      v-bind="bindOptions"
      @input="chooseOnInputFunc"
    />
    <button
      v-if="showClearButton"
      class="clear"
      type="button"
      @mousedown.prevent="emit('clear')"
      @focus.stop
    >
      <cross-svg transform="rotate(45)" />
    </button>
    <button
      v-if="onSearch"
      type="button"
      class="search"
      @click="emit('search')"
    >
      <search-svg />
    </button>
  </div>
</template>

<style scoped lang="sass">
.wrapper
  position: relative
  &:not(:has(.search)) .clear
    right: 0
  &::after
    content: ''
    width: 100%
    height: 2px
    position: absolute
    bottom: 0
    left: 0
    background: var(--main)
    transition: 0.4s
    transform: scaleX(0)
  &.error::after
    background: var(--danger-semi-light)
  &:focus-within:has(input:focus)::after
    transform: scaleX(1)
  &.error
    input
      border-bottom: 1px solid var(--danger-semi-light)

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

.search
  position: absolute
  top: 0
  right: 0
  padding: 0 6px
  &:focus-visible
    outline: none
    svg
      fill: var(--main)
  &:hover svg
    fill: var(--main)
  svg
    fill: var(--gray)

.clear
  position: absolute
  top: 0
  right: 40px
  padding: 0 6px
  &:focus-visible
    outline: none
    svg
      stroke: var(--main)
  &:hover svg
    stroke: var(--main)
  svg
    stroke: var(--gray)
</style>
