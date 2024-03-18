<script setup lang="ts" generic="T extends string | number">
import { computed, useSlots } from 'vue'
import { useField } from 'vee-validate'
import { VInputText } from '@/components/UI'
import type { VInputTextProps } from './UI/VInputText.vue'

type Props = { name: string; label?: string } & Omit<
  VInputTextProps<T>,
  'modelValue' | 'id' | 'required' | 'error'
>

const props = defineProps<Props>()

const { value, errors, errorMessage } = useField<T>(props.name)

const errorMessages = computed((): string[] => {
  if (errors.value.length) {
    return errors.value
  }
  return [errorMessage.value || ' ']
})

const id = props.name + '-input'

const slots = useSlots()
</script>

<template>
  <div v-if="slots.default">
    <slot
      :errors="errorMessages"
      :is-error="Boolean(errorMessage)"
      :value="value"
    />
    <div
      v-for="error in errorMessages"
      :key="error"
      class="error"
    >
      {{ error }}
    </div>
  </div>
  <template v-else>
    <label
      :for="id"
      :class="{ 'text-danger-light': Boolean(errorMessage) }"
    >
      {{ label }}
    </label>
    <v-input-text
      v-bind="props"
      :id="id"
      v-model="value"
      :required="false"
      :error="Boolean(errorMessage)"
    />
    <div
      v-for="error in errorMessages"
      :key="error"
      class="error"
    >
      {{ error }}
    </div>
  </template>
</template>

<style scoped lang="sass">
.error
  color: var(--danger-light)
  font-size: 14px
  min-height: 22px
</style>
