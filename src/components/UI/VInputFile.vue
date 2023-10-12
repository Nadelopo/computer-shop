<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue'
import {
  insertInStorage,
  removeFromStorage,
  type Folder
} from '@/utils/queries/storage'
import type { Loading } from '@/types'

type Props = {
  modelValue: string | undefined
  required?: boolean
  folder: Folder
}

const props = withDefaults(defineProps<Props>(), {
  required: true
})

const emit = defineEmits<{
  'update:modelValue': [url: string]
}>()

const loading = ref<Loading>('loading')
const imageData = ref<File | null>(null)
const onInput = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target?.files) {
    loading.value = 'loading'
    imageData.value = target.files[0]
    const { url, error } = await insertInStorage(props.folder, imageData.value)
    if (error) {
      loading.value = 'error'
      return
    }
    emit('update:modelValue', url)
    loading.value = 'success'
  }
}

const remove = async () => {
  if (!imageData.value) return
  loading.value = 'loading'
  const { error } = await removeFromStorage(props.folder, imageData.value.name)
  if (error) {
    loading.value = 'error'
    return
  }

  emit('update:modelValue', '')
  imageData.value = null
  loading.value = 'success'
}

const input = ref<HTMLInputElement | null>(null)

watch(
  () => props.modelValue,
  (cur) => {
    if (!cur && input.value) {
      imageData.value = null
      input.value.value = ''
    }
  }
)

const removeOnReload = () => {
  if (imageData.value) {
    removeFromStorage(props.folder, imageData.value.name)
  }
}

window.addEventListener('beforeunload', removeOnReload)

onUnmounted(() => {
  window.removeEventListener('beforeunload', removeOnReload)
})
</script>

<template>
  <div v-if="modelValue !== undefined">
    <span class="wrapper">
      <input
        ref="input"
        type="file"
        class="input"
        :required="required"
        @input="onInput"
      />
    </span>
    <div v-if="modelValue">
      <img :src="modelValue" class="my-2" alt="картинка" width="300" />
      <button class="remove__btn" type="button" @click="remove">
        <div class="line line-1"></div>
        <div class="line line-2"></div>
      </button>
    </div>
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

.remove__btn
  background: red
  width: 30px
  height: 30px
  border-radius: 7px
  display: flex
  justify-content: center
  align-items: center
  position: relative
  transition: .3s
  &:active
    transform: scale(0.9)
  .line
    position: absolute
    background: #fff
    width: 70%
    height: 3px
    border-radius: 20px
    &-1
      transform: rotate(45deg)
    &-2
      transform: rotate(-45deg)
</style>
