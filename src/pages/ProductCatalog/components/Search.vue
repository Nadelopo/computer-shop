<script setup lang="ts">
import { useProductCatalogContext } from '../composables/useProductCatalogContext'
import { VInput } from '@/shared/components/UI'

const { search, setQueryParams } = useProductCatalogContext()

const applySearchQuery = () => {
  setQueryParams()
  ;(document.activeElement as HTMLElement).blur()
}
</script>

<template>
  <div>
    <VInput
      v-model="search"
      placeholder="поиск..."
      @keyup.enter="applySearchQuery"
      @clear=";(search = ''), applySearchQuery()"
    />
  </div>
</template>
