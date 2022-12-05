<script setup lang="ts">
import { ref, watch, onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useCategoriesStore } from '@/stores/categoriesStore'
import { removeFromStorage } from '@/utils/storageQueris'
import InputText from '@/components/UI/InputText.vue'
import InputFile from '@/components/UI/InputFile.vue'
import Loader from '@/components/UI/loader.vue'
import Button from '@/components/UI/Button.vue'
import type { IcategoryR, IcategoryU } from '@/types/tables'

const { categories } = storeToRefs(useCategoriesStore())
const { updateCategory } = useCategoriesStore()
const categoryId = Number(useRoute().params.categoryId)
const router = useRouter()

const loader = ref(false)
let oldImg: string | undefined = undefined
const newCategory = ref<IcategoryU | null>(null)

const setNewCategory = () => {
  const currentCategory: IcategoryR = categories.value.filter(
    (e) => e.id === categoryId
  )[0]
  newCategory.value = {
    id: currentCategory.id,
    enTitle: currentCategory.enTitle,
    img: currentCategory.img,
    title: currentCategory.title,
  }
}

onBeforeMount(() => {
  if (categories.value.length) {
    setNewCategory()
  }
})

watch(categories, (cur) => {
  if (cur.length) {
    setNewCategory()
  }
})

watch(
  () => newCategory.value,
  (cur) => {
    if (!oldImg && cur?.title) {
      const path = cur.img.split('/')
      oldImg = path.at(-1)
    }
    if (cur?.title) {
      loader.value = true
    }
  }
)

const save = async () => {
  if (newCategory.value) {
    await updateCategory(newCategory.value)
    newCategory.value = {
      id: 0,
      enTitle: '',
      img: '',
      title: '',
    }
    setTimeout(() => (loader.value = false))
    if (oldImg) {
      const data = await removeFromStorage('categories', oldImg)
      if (data) {
        router.push({
          name: 'Admin',
          params: { link: 'categories' },
        })
      }
    }
  }
}
</script>

<template>
  <div class="container">
    <form v-if="loader" class="list__form mt-16" @submit.prevent="save">
      <div>
        <label>наименование на русском</label>
        <InputText v-model="newCategory!.title" />
      </div>
      <div>
        <label>наименование на английском</label>
        <InputText v-model="newCategory!.enTitle" />
      </div>
      <div>
        <label>изображение</label>
        <InputFile
          v-model="newCategory!.img"
          folder="categories"
          :required="false"
        />
      </div>
      <div>
        <Button>сохранить</Button>
      </div>
    </form>
    <div v-else class="min-h-screen flex justify-center items-center">
      <Loader />
    </div>
  </div>
</template>
