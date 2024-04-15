<script setup lang="ts">
import { CrossSvg } from '@/assets/icons'
import { VButton } from '.'
import { nextTick, ref } from 'vue'

type Props = {
  onCreate?: (tag: string) => string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {})

const emit = defineEmits<{
  create: [tag: string]
}>()

const model = defineModel<string[]>({
  required: true
})

const showInput = ref(false)
const newTag = ref('')
const inputRef = ref<HTMLInputElement>()

const onNewTag = async () => {
  showInput.value = true
  await nextTick()
  inputRef.value?.focus()
}

const createTag = () => {
  if (!newTag.value) {
    showInput.value = false
    return
  }
  emit('create', newTag.value)
  if (props.onCreate) {
    model.value.push(props.onCreate(newTag.value))
  } else {
    model.value.push(newTag.value)
  }
  showInput.value = false
  newTag.value = ''
}
</script>

<template>
  <div class="my-4">
    <v-button
      v-for="(tag, i) in model"
      :key="i"
      type="button"
      variant="noactive"
      width="auto"
      :disabled
      static
      class="button"
    >
      {{ tag }}
      <button
        class="remove"
        :disabled
        @click="model = model.filter((t, j) => j !== i)"
      >
        <CrossSvg transform="rotate(45)" />
      </button>
    </v-button>
    <v-button
      variant="noactive"
      type="button"
      width="48px"
      :disabled
      :static="disabled"
      class="add"
      @click="onNewTag"
    >
      <div
        v-if="showInput"
        class="relative w-full"
      >
        <input
          ref="inputRef"
          v-model="newTag"
          class="input"
          type="text"
          @blur="createTag"
          @keydown.enter="createTag"
        />
        <div class="mirror">{{ newTag }}</div>
      </div>
      <CrossSvg
        v-else
        class="cross"
      />
    </v-button>
  </div>
</template>

<style scoped lang="sass">
.button
  margin-right: 8px
  margin-bottom: 8px
  &:last-child
    margin-right: 0
  .remove
    border-radius: 4px
    margin-left: 4px
    transition: .2s
    pointer-events: auto
    svg
      stroke: var(--color-main)
    &:hover:not(:disabled)
      background: rgba(0, 0, 0, 0.04)
    &:disabled
      pointer-events: none
      cursor: no-drop

.add
  position: relative
  margin-bottom: 8px
  min-width: 48px
  &:hover:not(:disabled)
    .cross
      stroke: #fff

.input
  background: initial
  outline: none
  border: none
  width: 100%
  position: absolute
  top: 0
  left: 0

.mirror
  padding: 0
  height: 24px
  overflow: hidden
  visibility: hidden
  position: static
  white-space: pre
  pointer-events: none

.cross
  stroke: var(--color-main)
</style>
