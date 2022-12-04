<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import ArrowSVG from '@/assets/icons/arrow.svg?component'
import { isOutside } from '@/utils/isOutside'

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  values: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const currentValue = ref(props.modelValue)
const active = ref(false)
const btn = ref<HTMLElement | null>(null)

const color = ref('#a9a9a9')

const onClick = (e: MouseEvent) => {
  const target = e.target as HTMLOptionElement
  currentValue.value = target.value
  emit('update:modelValue', currentValue.value)
  if (color.value === '#a9a9a9') {
    color.value = '#fff'
  }
}

const onHead = () => {
  if (active.value) {
    active.value = false
  } else {
    active.value = true
  }
}

const clickOutside = (e: MouseEvent) => {
  if (btn.value) {
    if (isOutside(btn.value, e)) {
      active.value = false
    }
  }
}

addEventListener('click', clickOutside)

onUnmounted(() => {
  removeEventListener('click', clickOutside)
})
</script>

<template>
  <span class="root">
    <button ref="btn" class="select" :class="{ active }" @click="onHead">
      <div class="head">
        <span>{{ currentValue ?? 'Select' }}</span>
        <ArrowSVG class="svg" :class="{ active }" />
      </div>
    </button>
    <div class="list" :class="{ active }">
      <option v-for="(value, i) in values" :key="i" @click="onClick">
        {{ value }}
      </option>
    </div>
  </span>
</template>

<style scoped lang="sass">
$transition: .2s

.root
  position: relative
  height: 38px
  display: inline-block

  width: 200px

.select
  border-radius: 12px
  background: var(--back-main)

  width: 200px
  height: 38px
  color: v-bind(color)
  padding: 7px 13px
  user-select: none
  cursor: pointer
  outline: none
  transition: $transition
  &.active
    border-radius: 12px 12px 0 0
  .head
    display: flex
    justify-content: space-between
    align-items: center


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
  border-radius: 0 0 12px 12px
  position: absolute
  top: 30px
  left: 0
  width: 100%
  transition: $transition
  background: var(--back-main)
  opacity: 0
  overflow: hidden
  visibility: hidden
  transform: translateY(-5px) scale(0.95)
  &.active
    opacity: 1
    visibility: visible
    transform: translateY(0) scale(1)

option
  padding: 6px 10px
  background: var(--back-main)
  width: 200px
  color: #fff
  transition: $transition
  cursor: pointer
  &:hover
    transform: translateX(4px)
    color: var(--color-text)
</style>
