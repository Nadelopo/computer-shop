<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useCategoriesStore } from '@/stores/categoriesStore'
import { VDoubleButtons, VInputText, VButton, VSelect } from '@/components/UI'
import type { CategorySpecificationForm } from './types'
import type { CategorySpecificationUpdate } from '@/types/tables/categorySpecifications.types'

const props = defineProps<{
  loading?: boolean
  type: 'create' | 'update'
}>()

const emit = defineEmits<{
  submit: [setInitialValues: boolean]
}>()

const { categories } = storeToRefs(useCategoriesStore())
const setInitialValue = ref(props.type === 'create')

const form = defineModel<
  CategorySpecificationForm | CategorySpecificationUpdate
>({ required: true })
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
        variantsValues: null,
        condition: 'greater'
      }
    } else {
      form.value = {
        ...form.value,
        type: false,
        step: null,
        min: null,
        max: null,
        variantsValues: [''],
        condition: null
      }
    }
  }
)
</script>

<template>
  <form
    class="list__form"
    @submit.prevent="emit('submit', setInitialValue)"
  >
    <div v-if="categories">
      <v-select
        v-model="form.categoryId"
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
      <v-input-text
        v-model.trim="form.units"
        :required="false"
      />
    </div>
    <div>
      <label>тип поля</label>
      <v-double-buttons
        v-if="form.type !== undefined"
        v-model="form.type"
        class="mt-2"
        text-first="числовой"
        text-second="текстовый"
      />
    </div>
    <template v-if="form.type">
      <div>
        <label>шаг изменения числа для поля ввода</label>
        <v-input-text
          v-model="form.step"
          type="number"
          :step="0.1"
        />
      </div>
      <div>
        <label>минимальное значение для поля ввода</label>
        <v-input-text
          v-model="form.min"
          type="number"
          :min="0"
        />
      </div>
      <div>
        <label>максимальное значение для поля ввода</label>
        <v-input-text
          v-model="form.max"
          type="number"
          :min="0"
        />
      </div>
      <div>
        <label>
          условия для лучшего значения
          <span class="text-xs"> (больще значит лучше или наоборот) </span>
        </label>
        <v-double-buttons
          class="mt-2"
          text-first="больше"
          text-second="меньше"
          :model-value="form.condition === 'greater'"
          @update:model-value="form.condition = $event ? 'greater' : 'less'"
        />
      </div>
    </template>
    <div v-else-if="form.variantsValues">
      <label>вартианты значений</label>
      <div
        v-for="(_, i) in form.variantsValues.length"
        :key="i"
      >
        <v-input-text v-model.trim="form.variantsValues[i]" />
      </div>
      <div class="flex gap-4">
        <v-button
          class="mt-4"
          type="button"
          @click="addVarianValues"
        >
          добавить
        </v-button>
        <v-button
          class="mt-4"
          type="button"
          @click="deleteVarianValues"
        >
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
    <div v-if="props.type === 'create'">
      <label>задать значение по умолчанию для товаров</label>
      <v-double-buttons
        v-model="setInitialValue"
        class="mt-2"
        text-first="да"
        text-second="нет"
      />
    </div>
    <div>
      <v-button
        :loading="loading"
        class="mt-4"
      >
        {{ type === 'create' ? 'создать характеристику' : 'сохранить' }}
      </v-button>
    </div>
  </form>
</template>
