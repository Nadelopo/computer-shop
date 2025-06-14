<script setup lang="ts">
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useFilterStore } from '@/pages/ProductCatalog/stores/filterStore'
import { useCustomRouter } from '@/shared/composables/customRouter'
import { VInputText } from '@/components/UI'

const route = useRoute()
const router = useCustomRouter()

const { search } = storeToRefs(useFilterStore())
const { setQueryParams } = useFilterStore()

const applySearchQuery = () => {
  setQueryParams(router, route)
  ;(document.activeElement as HTMLElement).blur()
}
</script>

<template>
  <div>
    <VInputText
      v-model="search"
      placeholder="поиск..."
      @keyup.enter="applySearchQuery"
      @clear=";(search = ''), applySearchQuery()"
    />
  </div>
</template>
