<script setup lang="ts">
import AdminWrapper from '@/components/Admin/AdminWrapper.vue'
import InputFile from '@/components/UI/InputFile.vue'
import InputText from '@/components/UI/InputText.vue'
import {
  useCategoriesStore,
  type IcategoriesValues,
} from '@/stores/categoriesStore'
import { ref } from 'vue'

const { createCategory } = useCategoriesStore()

let form = ref<IcategoriesValues>({
  img: '',
  title: '',
  enTitle: '',
})

const create = () => {
  createCategory(form.value)
  form.value = {
    img: '',
    title: '',
    enTitle: '',
  }
}
</script>

<template>
  <AdminWrapper>
    <form class="list" @submit.prevent="create">
      <div>
        <label>загрузить изображение</label>
        <InputFile v-model="form.img" class="mt-4" />
      </div>
      <div>
        <label>наименование на английском</label>
        <InputText v-model="form.enTitle" />
      </div>
      <div>
        <label>наименование на русском</label>
        <InputText v-model="form.title" />
      </div>
      <div>
        <button class="btn">создать категорию</button>
      </div>
    </form>
  </AdminWrapper>
</template>

<style scoped lang="sass">

.list
  display: flex
  flex-direction: column
  gap: 20px
</style>
