<script setup lang="ts">
import { onMounted, ref, watch, type PropType } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    required: true,
  },
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean as PropType<false>,
    default: true,
  },
})

defineEmits(['update:modelValue'])

const value = ref('')
watch(
  () => props.modelValue,
  (cur) => {
    if (!cur) {
      value.value = ''
    }
  }
)

const input = ref<HTMLInputElement | null>(null)
onMounted(() => {
  if (input.value && props.required) {
    input.value.setAttribute('required', '')
  }
})
</script>

<template>
  <div>
    <span class="wrapper">
      <input
        ref="input"
        v-model="value"
        :type="type"
        class="input"
        :placeholder="placeholder"
        @input="$emit('update:modelValue', value)"
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
  transition: 0.4s
</style>
