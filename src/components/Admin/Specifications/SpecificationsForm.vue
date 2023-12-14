<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useCategoriesStore } from '@/stores/categoriesStore'
import { VButtons, VInputText, VButton, VSelect } from '@/components/UI'
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

const savedVarianValues = ref<string[]>(form.value.variantsValues ?? [''])
watch(
  () => form.value.type,
  (cur) => {
    if (cur === 'number') {
      savedVarianValues.value = form.value.variantsValues ?? ['']
      form.value = {
        ...form.value,
        type: 'number',
        step: 1,
        min: 0,
        max: 64,
        variantsValues: null,
        condition: 'greater'
      }
    } else if (cur) {
      form.value = {
        ...form.value,
        type: cur,
        step: null,
        min: null,
        max: null,
        variantsValues: savedVarianValues.value,
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
      <label>тип поля </label>
      <v-buttons
        v-if="form.type !== undefined"
        v-model="form.type"
        :options="[
          { value: 'number', title: 'числовой' },
          { value: 'string', title: 'текстовый' },
          { value: 'union', title: 'объединение' }
        ]"
        class="mt-2"
      />
    </div>
    <template v-if="form.type === 'number'">
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
        <v-buttons
          v-if="form.condition"
          v-model="form.condition"
          class="mt-2"
          :options="[
            { value: 'greater', title: 'больше' },
            { value: 'less', title: 'меньше' }
          ]"
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
      <label>отображать на карточке товара </label>
      <v-buttons
        v-if="form.visible !== undefined"
        v-model="form.visible"
        class="mt-2"
        :options="[
          { value: true, title: 'да' },
          { value: false, title: 'нет' }
        ]"
      />
    </div>
    <div v-if="props.type === 'create'">
      <label>задать значение по умолчанию для товаров</label>
      <v-buttons
        v-model="setInitialValue"
        :options="[
          { value: true, title: 'да' },
          { value: false, title: 'нет' }
        ]"
        class="mt-2"
      />
    </div>
    <div>
      <v-button :loading="loading">
        {{ type === 'create' ? 'создать характеристику' : 'сохранить' }}
      </v-button>
    </div>
  </form>
</template>
