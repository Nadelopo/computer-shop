<script setup lang="ts" generic="T extends 'text' | 'number' | 'tel' = 'text'">
import { computed, useSlots } from 'vue'
import { useField } from 'vee-validate'
import { VInputText } from '@/components/UI'
import type { VInputTextProps } from './UI/VInputText.vue'

type Props = Omit<
  VInputTextProps,
  'modelValue' | 'id' | 'required' | 'error' | 'type'
> & {
  name?: string
  label?: string
  type?: T
  allErors?: boolean
  hideErrors?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showSpinButtons: true,
  name: '',
  type: 'text' as any,
  allErors: false
})

const { value, errors, errorMessage, setValue } = useField<
  T extends 'text' | 'tel' ? string : number
>(props.name)

const errorMessages = computed((): string[] => {
  const errorsValue = errors.value
  if (errorsValue.length) {
    return props.allErors ? errorsValue : [errorsValue[0]]
  }
  return ['']
})

const name = computed((): string => {
  if (props.name.includes('.')) {
    return props.name.split('.').at(-1) ?? ''
  }
  return props.name
})

const id = `${name.value}-field`

const slots = useSlots()
</script>

<template>
  <div>
    <label
      v-if="label !== undefined"
      :for="id"
      :class="{ 'text-danger-light': Boolean(errorMessage) }"
    >
      {{ label }}
    </label>
    <slot
      v-if="slots.default"
      :id="id"
      :errors="errorMessages"
      :is-error="Boolean(errorMessage)"
      :value="value"
      :set-value="setValue"
      :field-name="name"
    />
    <template v-else>
      <v-input-text
        v-bind="props"
        :id="id"
        v-model="value"
        :name="name"
        :required="false"
        :error="Boolean(errorMessage)"
      />
    </template>
    <template v-if="!hideErrors">
      <div
        v-for="error in errorMessages"
        :key="error"
        class="error"
      >
        {{ error }}
      </div>
    </template>
  </div>
</template>

<style scoped lang="sass">
.error
  color: var(--danger-semi-light)
  font-size: 14px
  min-height: 22px
</style>
