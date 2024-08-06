<script
  setup
  lang="ts"
  generic="T, U extends {value: Option<T>; title: string}"
>
import { ref, watchEffect } from 'vue'
import { VButton } from '@/components/UI'

export type Option<T> = T extends Array<infer V> ? V : T

const props = defineProps<{
  modelValue: T
  options: U[]
  loading?: boolean
  width?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [T]
}>()

const currentBtnIndex = ref(-1)
const onClick = (value: { value: Option<T>; title: string }, i: number) => {
  if (props.loading !== undefined) {
    currentBtnIndex.value = i
    if (props.loading) return
  }
  if (Array.isArray(props.modelValue)) {
    let updatedValues: string[] = []
    if (props.modelValue.includes(value.value)) {
      updatedValues = props.modelValue.filter((item) => item !== value.value)
    } else {
      updatedValues = [...props.modelValue, value.value]
    }
    emit('update:modelValue', updatedValues as T)
  } else {
    emit('update:modelValue', value.value as T)
  }
}

const isActive = (value: { value: Option<T>; title: string }) => {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.includes(value.value)
  } else if (value.value instanceof Date && props.modelValue instanceof Date) {
    return value.value.getTime() === props.modelValue.getTime()
  } else {
    return props.modelValue === value.value
  }
}

if (props.loading !== undefined) {
  watchEffect(() => {
    if (props.loading === false) {
      currentBtnIndex.value = -1
    }
  })
}
</script>

<template>
  <div>
    <v-button
      v-for="(option, i) in options"
      :key="i"
      type="button"
      :variant="isActive(option) ? 'primary' : 'noactive'"
      :loading="loading && currentBtnIndex === i"
      class="buttons__button"
      :width="width"
      @click="onClick(option, i)"
    >
      <slot
        v-if="$slots.default"
        v-bind="option"
      />
      <template v-else>
        {{ option.title }}
      </template>
    </v-button>
  </div>
</template>

<style scoped lang="sass">
.buttons__button
  margin-right: 8px
  margin-bottom: 8px
  &:last-child
    margin-right: 0
</style>
