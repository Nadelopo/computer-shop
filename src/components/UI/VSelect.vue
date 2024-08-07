<script setup lang="ts" generic="T extends string | number | boolean">
import { computed, onUnmounted, ref, watch, watchEffect } from 'vue'
import { onClickOutsideClose } from '@/utils/onClickOutsideClose'
import { ArrowSvg } from '@/assets/icons'

type Props = {
  options: { title: string; value: T }[]
  required?: boolean
  width?: 'max' | 'static'
  isError?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  width: 'static',
  required: true
})

defineEmits<{
  'update:modelValue': [T]
}>()

const modelValue = defineModel<
  [T | null | undefined] extends readonly (infer e)[] ? e : never
>({
  required: true
})

defineOptions({
  inheritAttrs: false
})

const widthValue = computed(() => (props.width === 'max' ? '100%' : '200px'))

const btn = ref<HTMLElement>()
const active = onClickOutsideClose(btn)
const selected = ref('')
const optionsRefs = ref<HTMLButtonElement[]>([])

const color = ref('#a9a9a9')

watch(
  [modelValue, () => props.options],
  () => {
    const { value } = modelValue
    const findSelectedValue = props.options.find((e) => e.value === value)
    if (findSelectedValue) {
      selected.value = findSelectedValue.title
      color.value = '#fff'
    } else if (value) {
      selected.value = String(value)
    } else {
      selected.value = 'выберите значение'
      color.value = '#a9a9a9'
    }
  },
  {
    immediate: true
  }
)

const onOptionClick = (selectValue: T, i: number) => {
  selected.value = props.options[i].title
  modelValue.value = selectValue
  if (color.value === '#a9a9a9') {
    color.value = '#fff'
  }
}

const onOptionUp = (i: number) => {
  if (i) {
    const prevElement = optionsRefs.value[i - 1]
    prevElement.focus()
  } else {
    const lastElement = optionsRefs.value.at(-1)
    lastElement?.focus()
  }
}

const onOptionDown = (i: number) => {
  if (i < props.options.length - 1) {
    const nextElement = optionsRefs.value[i + 1]
    nextElement.focus()
  } else {
    const firstElement = optionsRefs.value[0]
    firstElement.focus()
  }
}

const stopScrollDocument = (e: KeyboardEvent) => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault()
  }
  if (e.key === 'Escape') {
    active.value = false
  }
}

const onFocus = () => {
  const optionsRefsValue = optionsRefs.value
  if (optionsRefsValue) {
    const isValue = props.options.find((e) => e.value === modelValue.value)
    if (isValue) {
      const selectedElement = optionsRefsValue.filter(
        (e) => e.textContent === isValue.title
      )[0]
      setTimeout(() => selectedElement.focus(), 100)
    } else {
      setTimeout(() => {
        if (optionsRefsValue) {
          const firstChildren = optionsRefsValue[0]
          firstChildren.focus()
        }
      }, 100)
    }
  }
  active.value = !active.value
}

watchEffect(() => {
  if (active.value) {
    window.addEventListener('keydown', stopScrollDocument)
  } else {
    window.removeEventListener('keydown', stopScrollDocument)
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', stopScrollDocument)
})

const required = computed(() => {
  if (props.required) {
    let value = true
    if (props.options.find((e) => e.value === modelValue.value)) {
      value = false
    }
    return value
  }
  return false
})
</script>

<template>
  <div
    class="root__select"
    v-bind="$attrs"
  >
    <button
      ref="btn"
      class="select"
      type="button"
      :class="{ active, error: isError }"
      :title="options.find((e) => e.value === modelValue)?.title"
      @focus="onFocus"
    >
      <div class="head">
        <span>{{ selected ?? 'Select' }}</span>
        <arrow-svg
          class="svg"
          :class="{ active }"
        />
      </div>
    </button>
    <transition name="list">
      <div
        v-show="active"
        class="list"
      >
        <div class="scroll">
          <button
            v-for="(option, i) in options"
            :key="i"
            ref="optionsRefs"
            class="option"
            type="button"
            :class="modelValue === option.value && 'active '"
            @click="onOptionClick(option.value, i)"
            @keyup.arrow-down="onOptionDown(i)"
            @keyup.arrow-up="onOptionUp(i)"
          >
            {{ option.title }}
          </button>
        </div>
      </div>
    </transition>
    <select
      aria-label="Выберите значение"
      :required="required"
      class="required"
    />
  </div>
</template>

<style scoped lang="sass">
$transition: .2s
$back: var(--back-sec)

.root__select
  position: relative
  height: 38px
  width: v-bind(widthValue)

.select
  // border-radius: 12px
  border-radius: 4px
  background: $back
  border: 2px solid transparent
  width: v-bind(widthValue)
  height: 38px
  color: v-bind(color)
  padding: 7px 13px
  user-select: none
  cursor: pointer
  outline: none
  transition: $transition
  position: absolute
  z-index: 50
  &.active
    border-radius: 4px 4px 0 0
  .head
    display: flex
    justify-content: space-between
    align-items: center
    gap: 10px
    span
      text-overflow: ellipsis
      white-space: nowrap
      overflow: hidden
  &.error
    color: #ff8383
    svg
      fill: #ff8383

.icon-arrow
  width: 10px
  height: 10px

.svg
  width: 15px
  fill: #fff
  right: 0
  transition: $transition
  transform: rotate(180deg)
  &.active
    transform: rotate(360deg)

.list
  padding: 5px
  // border-radius: 0 0 12px 12px
  border-radius: 0 0 4px 4px
  position: absolute
  top: 36px
  left: 0
  width: 100%
  transition: $transition
  background: $back
  opacity: 1
  transform: translateY(0) scale(1)
  z-index: 100
  .scroll
    max-height: 200px
    overflow-y: auto
    &::-webkit-scrollbar
      width: 4px
    &::-webkit-scrollbar-track
      background-color: transparent
      border-radius: 20px
    &::-webkit-scrollbar-thumb
      background: var(--back-main)
      border-radius: 30px

.list-enter-active,
.list-leave-active
  transition: all $transition ease

.list-enter-from,
.list-leave-to
  opacity: 0
  transform: translateY(-5px) scale(0.95)

.option
  padding: 6px 10px
  background: $back
  width: 200px
  color: #fff
  transition: $transition
  cursor: pointer
  text-align: start
  width: calc(100% - 6px)
  border-radius: 4px
  margin-bottom: 2px
  &:hover, &:focus, &.active
    transform: translateX(6px)
    width: calc( 100% - 12px )
    margin-right: 6px
    outline: none
    color: var(--main-semi-light)
  &:hover, &:focus
    background: #1f292b

.required
  all: unset
  position: absolute
  width: 1px
  height: 1px
  left: 100px
  top: 39px
</style>
