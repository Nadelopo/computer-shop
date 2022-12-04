<script setup lang="ts">
import Select from '@/components/UI/Select.vue'
import { ref } from 'vue'

const value = ref('выберете значение')
const arr = ['vuex', 'pinia', 'redux']
</script>

<template>
  <div>
    <Select v-model="value" :values="arr" />
  </div>
</template>
