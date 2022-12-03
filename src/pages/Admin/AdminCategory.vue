<script setup lang="ts">
import { ref } from 'vue'
import InputFile from '@/components/UI/InputFile.vue'
import InputText from '@/components/UI/InputText.vue'
import { useCategoriesStore } from '@/stores/categoriesStore'
import type { IcategoryC } from '@/types/tables'
import CategoriesList from '@/components/Admin/CategoriesList.vue'

const { createCategory } = useCategoriesStore()

let form = ref<IcategoryC>({
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
  <div>
    <form class="list__form" @submit.prevent="create">
      <div>
        <label>загрузить изображение</label>
        <InputFile v-model="form.img" class="mt-4" folder="categories" />
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
    <hr class="my-8" />
    <div class="text-2xl font-bold mb-16">Изменение категоирии</div>
    <CategoriesList />
  </div>
</template>
