<script setup lang="ts">
import { ref } from 'vue'
import { onClickOutsideClose } from '@/utils/onClickOutsideClose'
import { VInputText } from '@/components/UI'
import type { LocationResult } from '@/utils/useGeoSuggest'

defineProps<{
  text: string
  locationResults: LocationResult['results'] | null
  required?: boolean
  error?: boolean
  name?: string
}>()

const emit = defineEmits<{
  clickOnSuggestion: [string]
  clickOnInput: [string]
}>()

const model = defineModel<string | null>({ default: '' })

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

const suggestionsRef = ref<HTMLElement>()
const suggestionsOpen = onClickOutsideClose(suggestionsRef)

const onClick = () => {
  emit('clickOnInput', 'locality')
  suggestionsOpen.value = true
}
</script>

<template>
  <div class="wrapper">
    <label :class="{ 'text-danger-light': error }">{{ text }}</label>
    <div
      ref="suggestionsRef"
      @click="onClick"
    >
      <v-input-text
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
        class="suggestions"
      >
        <div
          v-for="(locate, i) in locationResults"
          :key="i"
          class="suggestion"
          @click="emit('clickOnSuggestion', locate.title.text)"
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
        </div>
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
    top: 53px
    border: 2px solid var(--color-main)
    overflow: hidden
    .suggestion
      cursor: pointer
      padding: 0 10px
      &:hover
        background: #f1f1f1
</style>
