<script setup lang="ts">
import { insertInStorage } from '@/utils/insertInStorage'
import { removeFromStorage } from '@/utils/removeFromStorage'
import { ref } from 'vue'

const img = ref('')
const imageData = ref<File | null>(null)
const onInput = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target?.files) {
    imageData.value = target.files[0]
    const url = await insertInStorage('categories', imageData.value)
    if (url) img.value = url
  }
}

const remove = async () => {
  if (imageData.value) {
    const isSuccess = await removeFromStorage(
      'categories',
      imageData.value.name
    )
    if (isSuccess) {
      img.value = ''
      imageData.value = null
    }
  }
}
</script>

<template>
  <div>
    <span class="wrapper">
      <input type="file" class="input" @input="onInput" />
    </span>
    <div v-if="img">
      <img :src="img" class="my-2" alt="картинка" width="300" />
      <button class="remove__btn" @click="remove">
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
</style>
