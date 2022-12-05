<script setup lang="ts">
import Select from '@/components/UI/Select.vue'
import { ref } from 'vue'

const value = ref('выберете значение')
const arr = [
  { value: '1', title: 'vuex' },
  { value: '2', title: 'pinia' },
  { value: '3', title: 'redux' },
]
</script>

<template>
  <div>
    <Select v-model="value" :options="arr" />
  </div>
</template>
