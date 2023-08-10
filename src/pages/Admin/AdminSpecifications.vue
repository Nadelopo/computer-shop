<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { createMany, getAll } from '@/utils/queries/db'
import { useCategoriesStore } from '@/stores/categoriesStore'
import SpecificationsList from '@/components/Admin/SpecificationsList.vue'
import VDoubleButtons from '@/components/UI/VDoubleButtons.vue'
import VInputText from '@/components/UI/VInputText.vue'
import VButton from '@/components/UI/VButton.vue'
import VSelect from '@/components/UI/VSelect.vue'
import type { CategorySpecificationCreate } from '@/types/tables/categorySpecifications.types'
import type { SpecificationCreate } from '@/types/tables/specifications.types'

const { categories } = storeToRefs(useCategoriesStore())
const { createCategorySpecifications } = useCategoriesStore()

const select = ref('выберите категорию')

const form = ref<CategorySpecificationCreate>({
  categoryId: 0,
  title: '',
  enTitle: '',
  type: true,
  visible: false,
  units: '',
  step: 1,
  min: 0,
  max: 64,
  variantsValues: null
})

const setInitialSpecificationValue = ref(false)

watch(select, (cur) => {
  if (typeof cur === 'number') {
    form.value.categoryId = cur
  }
})

const create = async () => {
  const data = await createCategorySpecifications(form.value)

  if (data) {
    const { data: products } = await getAll('products', {
      match: { categoryId: data.categoryId }
    })

    const initialSpecificationsValue: SpecificationCreate[] = []
    for (const product of products || []) {
      initialSpecificationsValue.push({
        productId: product.id,
        categorySpecificationsId: data.id,
        valueNumber: data.type ? 0 : null,
        valueString: data.type ? null : data.variantsValues[0]
      })
    }

    createMany('specifications', initialSpecificationsValue)

    form.value = {
      categoryId: 0,
      title: '',
      enTitle: '',
      type: true,
      visible: false,
      units: '',
      step: 1,
      min: 0,
      max: 64,
      variantsValues: null
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

watch(
  () => form.value.type,
  (cur) => {
    if (cur) {
      form.value = {
        ...form.value,
        type: true,
        step: 1,
        min: 0,
        max: 64,
        variantsValues: null
      }
    } else {
      form.value = {
        ...form.value,
        type: false,
        step: null,
        min: null,
        max: null,
        variantsValues: ['']
      }
    }
  }
)
</script>

<template>
  <div>
    <form class="list__form" @submit.prevent="create">
      <div v-if="categories">
        <v-select
          v-model="select"
          :options="categories.map((e) => ({ value: e.id, title: e.title }))"
        />
      </div>
      <div>
        <label>наименование</label>
        <v-input-text v-model.trim="form.title" />
      </div>
      <div>
        <label>наименование на английском</label>
        <v-input-text v-model.trim="form.enTitle" />
      </div>
      <div>
        <label>единицы измерения</label>
        <v-input-text v-model.trim="form.units" :required="false" />
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
        <div>
          <label>шаг изменения числа для поля ввода</label>
          <v-input-text v-model="form.step" type="number" :step="0.1" />
        </div>
        <div>
          <label>минимальное значение для поля ввода</label>
          <v-input-text v-model="form.min" type="number" :min="0" />
        </div>
        <div>
          <label>максимальное значение для поля ввода</label>
          <v-input-text v-model="form.max" type="number" :min="0" />
        </div>
      </template>
      <div v-else-if="form.variantsValues">
        <label>вартианты значений</label>
        <div v-for="(_, i) in form.variantsValues.length" :key="i">
          <v-input-text v-model.trim="form.variantsValues[i]" />
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
          v-if="form.visible !== undefined"
          v-model="form.visible"
          class="mt-2"
          text-first="да"
          text-second="нет"
        />
      </div>
      <div>
        <label>задать значение по умолчанию для товаров</label>
        <v-double-buttons
          v-model="setInitialSpecificationValue"
          class="mt-2"
          text-first="да"
          text-second="нет"
        />
      </div>
      <div>
        <v-button class="mt-4">создать характеристику</v-button>
      </div>
    </form>
    <specifications-list />
  </div>
</template>
