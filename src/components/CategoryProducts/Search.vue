<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useFilterStore } from '@/stores/filterStore'
import { VInputText } from '@/components/UI'

const route = useRoute()
const router = useRouter()

const { search } = storeToRefs(useFilterStore())
const { setQueryParams } = useFilterStore()

const onEnter = () => {
  setQueryParams(router, route)
  ;(document.activeElement as HTMLElement).blur()
}
</script>

<template>
  <div>
    <v-input-text
      v-model="search"
      placeholder="поиск..."
      @keyup.enter="onEnter"
    />
  </div>
</template>
