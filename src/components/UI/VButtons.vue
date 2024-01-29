<script
  setup
  lang="ts"
  generic="T extends boolean | string | string[] | number"
>
import { VButton } from '@/components/UI'

type Value = T extends string | string[]
  ? string
  : T extends boolean
  ? boolean
  : number
type ValueArg = string | boolean | number

const props = defineProps<{
  modelValue: T
  options: {
    value: Value
    title: string
  }[]
}>()

const emit = defineEmits<{
  'update:modelValue': [T]
}>()

const onClick = (value: { value: ValueArg; title: string }) => {
  if (Array.isArray(props.modelValue)) {
    let updatedValues: string[] = []
    if (props.modelValue.includes(value.value as string)) {
      updatedValues = props.modelValue.filter((item) => item !== value.value)
    } else {
      updatedValues = [...props.modelValue, value.value as T]
    }
    emit('update:modelValue', updatedValues as T)
  } else {
    emit('update:modelValue', value.value as T)
  }
}

const isActive = (value: { value: ValueArg; title: string }) => {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.includes(value.value as string)
  } else {
    return props.modelValue === value.value
  }
}
</script>

<template>
  <div class="wrap">
    <v-button
      v-for="(value, i) in options"
      :key="i"
      type="button"
      :variant="isActive(value) ? 'primary' : 'noactive'"
      @click="onClick(value)"
    >
      {{ value.title }}
    </v-button>
  </div>
</template>

<style scoped lang="sass">
.wrap
  display: flex
  gap: 10px
</style>
