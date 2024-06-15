<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue'
import { getRouteTo } from './getRouteTo'
import type { Suggestion } from './Navbar.vue'

const props = defineProps<{
  isSuggestionsOpen: boolean
  suggestions: Suggestion[]
  mobile?: boolean
}>()

const emit = defineEmits<{
  clickOnSuggestion: []
  setSearch: [string]
}>()

const currentSuggestionIndex = ref(-1)

const onArrow = (e: KeyboardEvent) => {
  if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
  if (e.key === 'ArrowDown') {
    currentSuggestionIndex.value++
    if (currentSuggestionIndex.value === props.suggestions.length) {
      currentSuggestionIndex.value = 0
    }
  } else {
    currentSuggestionIndex.value--
    if (currentSuggestionIndex.value < 0) {
      currentSuggestionIndex.value = props.suggestions.length - 1
    }
  }
  if (currentSuggestionIndex.value === -1) return
  emit('setSearch', props.suggestions[currentSuggestionIndex.value].title)
}

watch(
  () => [props.isSuggestionsOpen, props.suggestions.length],
  () => {
    if (props.isSuggestionsOpen && props.suggestions.length) {
      window.addEventListener('keydown', onArrow)
    } else {
      window.removeEventListener('keydown', onArrow)
    }
  }
)

watch(
  () => props.suggestions,
  () => {
    currentSuggestionIndex.value = -1
  },
  { deep: true }
)

onUnmounted(() => {
  window.removeEventListener('keydown', onArrow)
})
</script>

<template>
  <div
    v-if="mobile ? true : isSuggestionsOpen && suggestions.length"
    :class="{ suggestions: !mobile }"
  >
    <div :class="{ container: !mobile }">
      <div :class="{ 'pl-60 flex flex-col gap-2': !mobile }">
        <router-link
          v-for="(suggestion, i) in suggestions"
          :key="suggestion.title"
          :to="getRouteTo(suggestion)"
          :class="[
            mobile ? 'suggestion__mobile' : 'suggestion',
            suggestion.type === 'category' && 'font-bold',
            currentSuggestionIndex === i && 'active'
          ]"
          @click="emit('clickOnSuggestion')"
        >
          {{ suggestion.title }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped lang="sass">
.suggestions
  position: absolute
  top: 67px
  background: var(--back-main)
  width: 100%
  color: #fff
  padding-bottom: 10px
  z-index: 10
  .suggestion
    cursor: pointer
    transition: .1s
    padding: 2px 0px
    &:hover, &:focus, &:focus-visible
      color: var(--main-semi-light)
    &.active
      background: var(--back-sec)
      border-radius: 4px
      padding: 2px 6px

.suggestion__mobile
  padding: 10px 0
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap
  display: block
  &:active
    color: var(--main-semi-light)
</style>
