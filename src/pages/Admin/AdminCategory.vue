<script setup lang="ts">
import AdminWrapper from '@/components/Admin/AdminWrapper.vue'
import InputFile from '@/components/UI/InputFile.vue'
import InputText from '@/components/UI/InputText.vue'
import { ref } from 'vue'
const test = ref('1')
const test1 = ref('1')
</script>

<template>
  <AdminWrapper>
    <div class="list">
      <div>
        <label>загрузить изображение</label>
        <InputFile class="mt-4" />
      </div>
      <div>
        <label>наименование на английском</label>
        <InputText v-model="test" />
      </div>
      <div>
        <label>наименование на русском</label>
        <InputText v-model="test1" />
      </div>
    </div>
  </AdminWrapper>
</template>

<style scoped lang="sass">

.list
  display: flex
  flex-direction: column
  gap: 20px
</style>
