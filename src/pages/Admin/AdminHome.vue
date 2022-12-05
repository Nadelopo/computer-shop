<script setup lang="ts">
import { ref } from 'vue'
import VSelect from '@/components/UI/VSelect.vue'

const value = ref('выберете значение')
const arr = [
  { value: '1', title: 'vuex' },
  { value: '2', title: 'pinia' },
  { value: '3', title: 'redux' },
]
</script>

<template>
  <div>
    <v-select v-model="value" :options="arr" />
  </div>
</template>
