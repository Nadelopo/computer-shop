<script setup lang="ts">
import { ref, watch } from 'vue'
import DoubleButtons from '@/components/UI/DoubleButtons.vue'
import InputText from '@/components/UI/InputText.vue'
import { useCategoriesStore } from '@/stores/categoriesStore'
import { storeToRefs } from 'pinia'
import type { IcategoryFieldCU } from '@/stores/categoriesStore/types'

const { categories } = storeToRefs(useCategoriesStore())
const { createCategoryFields } = useCategoriesStore()

const select = ref('')

const form = ref<IcategoryFieldCU>({
  categoryId: 0,
  title: '',
  type: true,
  visible: false,
  units: '',
})

watch(select, (cur) => {
  if (typeof cur === 'number') {
    form.value.categoryId = cur
  }
})

const create = async () => {
  const resp = await createCategoryFields(form.value)
  if (resp) {
    form.value = {
      categoryId: 0,
      title: '',
      type: true,
      visible: false,
      units: '',
    }
    select.value = ''
  }
}
</script>

<template>
  <form class="list__form" @submit.prevent="create">
    <div v-if="categories">
      <select v-model="select" required>
        <option value="" selected disabled hidden>выберите категорию</option>
        <option
          v-for="category in categories"
          :key="category.id"
          :value="category.id"
        >
          {{ category.title }}
        </option>
      </select>
    </div>
    <div>
      <label>наименование</label>
      <InputText v-model="form.title" />
    </div>
    <div>
      <label>единицы измерения</label>
      <InputText v-model="form.units" :required="false" />
    </div>
    <div>
      <label>тип поля</label>
      <DoubleButtons
        v-model="form.type"
        class="mt-2"
        text-first="числовой"
        text-second="текстовый"
      />
    </div>
    <div>
      <label>отображать на карточке товара</label>
      <DoubleButtons
        v-model="form.visible"
        class="mt-2"
        text-first="да"
        text-second="нет"
      />
    </div>

    <div>
      <button class="btn mt-4">создать поле</button>
    </div>
  </form>
</template>
