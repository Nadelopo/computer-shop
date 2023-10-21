<script setup lang="ts">
import { ref } from 'vue'
import { useCategoriesStore } from '@/stores/categoriesStore'
import CategoriesList from '@/components/Admin/CategoriesList.vue'
import { VButton, VInputFile, VInputText } from '@/components/UI'
import type { CategoryCreate } from '@/types/tables/categories.types'
import type { Loading } from '@/types'
import type { InputFileActions } from '@/components/UI/VInputFile/types'

const { createCategory } = useCategoriesStore()

let form = ref<CategoryCreate>({
  img: '',
  title: '',
  enTitle: ''
})

const inputFileRef = ref<InputFileActions>()
const loading = ref<Loading>('loading')
const create = async () => {
  const { error: errorImage, url } = (await inputFileRef.value?.onSave()) || {}
  if (errorImage) {
    loading.value = 'error'
    return
  }
  if (url) {
    form.value.img = url
  }
  const { error } = await createCategory(form.value)
  if (error) {
    loading.value = 'error'
    return
  }
  form.value = {
    img: '',
    title: '',
    enTitle: ''
  }
  loading.value = 'success'
}
</script>

<template>
  <div>
    <form
      class="list__form"
      @submit.prevent="create"
    >
      <div>
        <label>загрузить изображение</label>
        <v-input-file
          ref="inputFileRef"
          :file-url="form.img"
          class="mt-4"
          folder="categories"
        />
      </div>
      <div>
        <label>наименование на английском</label>
        <v-input-text v-model="form.enTitle" />
      </div>
      <div>
        <label>наименование на русском</label>
        <v-input-text v-model="form.title" />
      </div>
      <div>
        <v-button>создать категорию</v-button>
      </div>
    </form>
    <hr class="my-8" />
    <div class="text-2xl font-bold mb-16">Изменение категоирии</div>
    <CategoriesList />
  </div>
</template>
