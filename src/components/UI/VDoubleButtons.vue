<script setup lang="ts">
import VButton from '@/components/UI/VButton.vue'
import type { PropType } from 'vue'

defineProps({
  textFirst: {
    type: String,
    default: 'true',
  },
  textSecond: {
    type: String,
    default: 'false',
  },
  type: {
    type: String as PropType<'button' | 'submit' | 'reset' | undefined>,
    default: 'button',
  },
  modelValue: Boolean,
})
defineEmits(['update:modelValue'])
</script>

<template>
  <div class="wrap">
    <v-button
      type="button"
      :class="!modelValue && 'btn__noactive'"
      @click="$emit('update:modelValue', true)"
    >
      {{ textFirst }}
    </v-button>
    <v-button
      :type="type"
      :class="modelValue && 'btn__noactive'"
      @click="$emit('update:modelValue', false)"
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
