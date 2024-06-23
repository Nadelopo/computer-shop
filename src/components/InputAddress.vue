<script setup lang="ts">
import { onUnmounted, ref, watchEffect } from 'vue'
import { onClickOutsideClose } from '@/utils/onClickOutsideClose'
import { VInputText } from '@/components/UI'
import type { LocationResult } from '@/utils/useGeoSuggest'

const props = defineProps<{
  locationResults: LocationResult['results'] | null
  required?: boolean
  error?: boolean
  name?: string
  id?: string
}>()

const emit = defineEmits<{
  clickOnSuggestion: [string]
  clickOnInput: [string]
}>()

const model = defineModel<string>({ default: '' })

const chooseColored = (
  hl: { begin: number; end: number }[] | undefined,
  index: number
) => {
  for (const h of hl ?? []) {
    if (index >= h.begin && index < h.end) {
      return true
    }
  }
}

const inputRef = ref<HTMLElement>()
const suggestionsOpen = onClickOutsideClose(inputRef)

const onClick = () => {
  emit('clickOnInput', 'locality')
  suggestionsOpen.value = true
}

const stopScrollDocument = (e: KeyboardEvent) => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault()
  }
}

const suggestionsRef = ref<HTMLElement>()
watchEffect(() => {
  if (suggestionsRef.value) {
    addEventListener('keydown', stopScrollDocument)
  } else {
    removeEventListener('keydown', stopScrollDocument)
  }
})
onUnmounted(() => {
  removeEventListener('keydown', stopScrollDocument)
})

const onSuggestionKey = (e: Event, type: 'down' | 'up') => {
  if (!suggestionsRef.value) return
  const target = e.target as HTMLElement
  const children = suggestionsRef.value.children
  let nextFocusedElement: HTMLElement | undefined
  if (type === 'down') {
    nextFocusedElement = target.nextElementSibling as HTMLElement
    if (!nextFocusedElement) {
      nextFocusedElement = children[0] as HTMLElement
    }
  }
  if (type === 'up') {
    nextFocusedElement = target.previousElementSibling as HTMLElement
    if (!nextFocusedElement) {
      nextFocusedElement = children[children.length - 1] as HTMLElement
    }
  }
  nextFocusedElement?.focus()
}

const onInputKey = (type: 'down' | 'up') => {
  if (!suggestionsRef.value) return
  const children = suggestionsRef.value.children
  if (type === 'down') {
    //prettier-ignore
    (children[0] as HTMLElement).focus()
  }
  if (type === 'up') {
    //prettier-ignore
    (children[children.length - 1] as HTMLElement).focus()
  }
}

const id = props.id ?? props.name + '-input'
</script>

<template>
  <div class="wrapper">
    <div
      ref="inputRef"
      @click="onClick"
      @keyup.arrow-down="onInputKey('down')"
      @keyup.arrow-up="onInputKey('up')"
    >
      <v-input-text
        :id="id"
        v-model="model"
        :debounce="500"
        :required="required"
        :error="error"
        :name="name"
      />
    </div>
    <Transition name="v">
      <div
        v-if="suggestionsOpen && locationResults"
        ref="suggestionsRef"
        class="suggestions"
      >
        <button
          v-for="(locate, i) in locationResults"
          :key="i"
          type="button"
          class="suggestion"
          @click="emit('clickOnSuggestion', locate.title.text)"
          @keyup.arrow-down="onSuggestionKey($event, 'down')"
          @keyup.arrow-up="onSuggestionKey($event, 'up')"
        >
          <template
            v-for="(s, j) in locate.title.text"
            :key="j"
          >
            <span
              v-if="chooseColored(locate.title.hl, j)"
              class="text-text"
            >
              {{ s }}
            </span>
            <template v-else>
              {{ s }}
            </template>
          </template>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="sass">
.v-enter-active,
.v-leave-active
  transition: 0.2s

.v-enter-from,
.v-leave-to
  opacity: 0

.wrapper
  position: relative
  .suggestions
    position: absolute
    background: #fff
    z-index: 100
    width: 100%
    border-radius: 0 0 4px 4px
    top: 28px
    border: 2px solid var(--main)
    overflow: hidden
    .suggestion
      width: 100%
      text-align: start
      cursor: pointer
      padding: 0 10px
      border-top: 2px solid transparent
      border-bottom: 2px solid transparent
      &:hover, &:focus
        background: #f1f1f1
        outline: none
</style>
