<script setup lang="ts">
import AdminWrapper from '@/components/Admin/AdminWrapper.vue'
import InputText from '@/components/UI/InputText.vue'
import { ref } from 'vue'
const test = ref('1')
</script>

<template>
  <AdminWrapper>
    <div class="relative">
      {{ test }}
      <div><InputText v-model="test" /></div>
    </div>
  </AdminWrapper>
</template>
