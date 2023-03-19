<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useCategoriesStore } from '@/stores/categoriesStore'
import VDoubleButtons from '@/components/UI/VDoubleButtons.vue'
import VInputText from '@/components/UI/VInputText.vue'
import VButton from '@/components/UI/VButton.vue'
import type { IcategorySpecificationCU } from '@/types/tables'
import VSelect from '@/components/UI/VSelect.vue'

const { categories } = storeToRefs(useCategoriesStore())
const { createCategorySpecifications } = useCategoriesStore()

const select = ref('выберите категорию')

const form = ref<IcategorySpecificationCU>({
  categoryId: 0,
  title: '',
  type: true,
  visible: false,
  units: '',
  step: 1,
  min: 0,
  max: 64,
  variantsValues: ['']
})

watch(select, (cur) => {
  if (typeof cur === 'number') {
    form.value.categoryId = cur
  }
})

const create = async () => {
  if (form.value.type) {
    delete form.value.variantsValues
  } else {
    delete form.value.min
    delete form.value.max
    delete form.value.step
  }

  const { data } = await createCategorySpecifications(form.value)
  if (data) {
    form.value = {
      categoryId: 0,
      title: '',
      type: true,
      visible: false,
      units: '',
      step: 1,
      min: 0,
      max: 64,
      variantsValues: ['']
    }
    select.value = 'выберите категорию'
  }
}

const addVarianValues = () => {
  if (Array.isArray(form.value.variantsValues)) {
    form.value.variantsValues[form.value.variantsValues.length] = ''
  }
}

const deleteVarianValues = () => {
  if (Array.isArray(form.value.variantsValues)) {
    form.value.variantsValues.splice(-1)
  }
}
</script>

<template>
  <form class="list__form" @submit.prevent="create">
    <div v-if="categories">
      <v-select
        v-model="select"
        :options="categories.map((e) => ({ value: e.id, title: e.title }))"
      />
    </div>
    <div>
      <label>наименование</label>
      <v-input-text v-model="form.title" />
    </div>
    <div>
      <label>единицы измерения</label>
      <v-input-text v-model="form.units" :required="false" />
    </div>
    <div>
      <label>тип поля</label>
      <v-double-buttons
        v-model="form.type"
        class="mt-2"
        text-first="числовой"
        text-second="текстовый"
      />
    </div>
    <template v-if="form.type">
      <div v-if="typeof form.step == 'number'">
        <label>шаг изменения числа для поля ввода</label>
        <v-input-text v-model="form.step" type="number" :step="0.1" />
      </div>
      <div v-if="typeof form.min == 'number'">
        <label>минимальное значение для поля ввода</label>
        <v-input-text v-model="form.min" type="number" :min="0" />
      </div>
      <div v-if="typeof form.max == 'number'">
        <label>максимальное значение для поля ввода</label>
        <v-input-text v-model="form.max" type="number" :min="0" />
      </div>
    </template>
    <div v-else-if="Array.isArray(form.variantsValues)">
      <label>вартианты значений</label>
      <div v-for="(_, i) in form.variantsValues.length" :key="i">
        <v-input-text v-model="form.variantsValues[i]" />
      </div>
      <div class="flex gap-4">
        <v-button class="mt-4" type="button" @click="addVarianValues">
          добавить
        </v-button>
        <v-button class="mt-4" type="button" @click="deleteVarianValues">
          удалить
        </v-button>
      </div>
    </div>
    <div>
      <label>отображать на карточке товара</label>
      <v-double-buttons
        v-model="form.visible"
        class="mt-2"
        text-first="да"
        text-second="нет"
      />
    </div>

    <div>
      <v-button class="mt-4">создать характеристику</v-button>
    </div>
  </form>
</template>
