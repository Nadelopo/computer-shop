<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useFilterStore } from '@/stores/filterStore'
import VInputText from '../UI/VInputText.vue'

const { search } = storeToRefs(useFilterStore())
</script>

<template>
  <div>
    <v-input-text v-model="search" placeholder="поиск..." />
  </div>
</template>
