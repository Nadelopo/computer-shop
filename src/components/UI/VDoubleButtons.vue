<script setup lang="ts">
import { VButton } from '@/components/UI'

defineProps<{
  textFirst: string
  textSecond: string
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [boolean]
}>()
</script>

<template>
  <div class="wrap">
    <v-button
      type="button"
      :class="!modelValue && 'noactive'"
      @click="emit('update:modelValue', true)"
    >
      {{ textFirst }}
    </v-button>
    <v-button
      type="button"
      :class="modelValue && 'noactive'"
      @click="emit('update:modelValue', false)"
    >
      {{ textSecond }}
    </v-button>
  </div>
</template>

<style scoped lang="sass">

.wrap
  display: flex
  gap: 10px
</style>
