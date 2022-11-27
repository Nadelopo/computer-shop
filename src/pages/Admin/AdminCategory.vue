<script setup lang="ts">
import InputFile from '@/components/UI/InputFile.vue'
import InputText from '@/components/UI/InputText.vue'
import {
  useCategoriesStore,
  type IcategoriesInsert,
} from '@/stores/categoriesStore'
import { ref } from 'vue'

const { createCategory } = useCategoriesStore()

let form = ref<IcategoriesInsert>({
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
  <form class="list__form" @submit.prevent="create">
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
</template>
