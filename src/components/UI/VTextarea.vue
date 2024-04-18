<script setup lang="ts">
import { onMounted, ref, watch, type TextareaHTMLAttributes } from 'vue'

interface Props extends /* @vue-ignore */ TextareaHTMLAttributes {
  required?: boolean
  autofocus?: true
  rows?: number
  autoGrow?: boolean
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  required: true
})

const modelValue = defineModel<string>({ required: true })

const textareaRef = ref<HTMLInputElement | null>(null)
onMounted(() => {
  if (!textareaRef.value) return
  if (props.autofocus) {
    textareaRef.value.focus()
  }
  if (props.autoGrow) {
    textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px'
  }
})
if (props.autoGrow) {
  watch(modelValue, () => {
    if (!textareaRef.value) return

    textareaRef.value.style.height = '0'
    textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px'
  })
}

const rows = props.autoGrow ? 1 : props.rows ?? 2
</script>

<template>
  <div>
    <span class="wrapper">
      <textarea
        :id="id"
        ref="textareaRef"
        v-model="modelValue"
        :required="required"
        v-bind="$attrs"
        :rows="rows"
        :class="autoGrow && ['resize-none', 'overflow-y-hidden']"
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
    bottom: 4px
    left: 0
    background: var(--main)
    transition: transform 0.4s
    transform: scaleX(0)
  &:focus-within::after
    transform: scaleX(1)
  textarea
    outline: none
    width: 100%
    padding: 6px 0
    border-bottom: 1px solid #9e9e9e
    background: initial
    text-align: justify
    cursor: inherit
    &::-webkit-scrollbar
      width: 8px
    &::-webkit-scrollbar-thumb
      background: #7b7b7b
      border-radius: 10px
</style>
