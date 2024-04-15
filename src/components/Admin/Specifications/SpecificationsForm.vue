<script setup lang="ts">
import { ref, unref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useForm } from 'vee-validate'
import { number, string } from 'yup'
import { useCategoriesStore } from '@/stores/categoriesStore'
import { VButtons, VInputText, VButton, VSelect, VTags } from '@/components/UI'
import FormField from '@/components/FormField.vue'
import type { CategorySpecificationForm } from './types'
import type { CategorySpecificationCreate } from '@/types/tables/categorySpecifications.types'

type FormData = Omit<
  CategorySpecificationForm,
  'categoryId' | 'title' | 'enTitle'
>

const props = defineProps<{
  loading?: boolean
  type: 'create' | 'update'
  formData?: CategorySpecificationCreate
}>()

const emit = defineEmits<{
  submit: [
    values: CategorySpecificationForm,
    setInitialValues: boolean,
    reset: () => void
  ]
}>()

const initialFormValue: FormData = {
  type: 'number',
  visible: false,
  units: '',
  step: 1,
  min: 0,
  max: 64,
  variantsValues: null,
  condition: 'greater'
}

const form = ref<FormData>({ ...initialFormValue })

const { values, setValues, handleSubmit, resetForm } = useForm<
  Pick<CategorySpecificationForm, 'categoryId' | 'title' | 'enTitle'>
>({
  initialValues: {
    categoryId: null,
    title: '',
    enTitle: ''
  },
  validationSchema: {
    categoryId: number().required(),
    title: string().required(),
    enTitle: string().required()
  }
})

if (props.formData) {
  const { categoryId, enTitle, title, ...rest } = unref(props.formData)
  setValues({ categoryId, enTitle, title })
  form.value = rest
}

const { categories } = storeToRefs(useCategoriesStore())
const setInitialValue = ref(props.type === 'create')

const savedVarianValues = ref<string[]>(form.value.variantsValues ?? [])
watch(
  () => form.value.type,
  (cur) => {
    let fields: Partial<CategorySpecificationForm> = {}
    if (cur === 'number') {
      savedVarianValues.value = form.value.variantsValues ?? []
      fields = {
        type: 'number',
        step: 1,
        min: 0,
        max: 64,
        variantsValues: null,
        condition: 'greater'
      }
    } else if (cur) {
      fields = {
        type: cur,
        step: null,
        min: null,
        max: null,
        variantsValues: savedVarianValues.value,
        condition: null
      }
    }
    form.value = { ...form.value, ...fields }
  }
)

const reset = () => {
  resetForm()
  form.value = { ...initialFormValue }
}
const submit = handleSubmit(() => {
  emit('submit', { ...values, ...form.value }, setInitialValue.value, reset)
})
</script>

<template>
  <form
    class="flex flex-col gap-y-2"
    @submit.prevent="submit"
  >
    <form-field
      v-slot="{ value, setValue, isError }"
      type="number"
      name="categoryId"
      label="Категория"
      hide-errors
    >
      <v-select
        class="my-2"
        :options="categories.map((e) => ({ value: e.id, title: e.title }))"
        :required="false"
        :is-error="isError"
        :model-value="value"
        @update:model-value="setValue($event)"
      />
    </form-field>
    <form-field
      name="title"
      label="Наименование"
    />
    <form-field
      name="enTitle"
      label="Наименование на английском"
    />
    <div>
      <label for="units">Единицы измерения</label>
      <v-input-text
        v-model.trim="form.units"
        :required="false"
      />
    </div>
    <div>
      <label>тип поля </label>
      <v-buttons
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
      <div class="my-3">
        <label for="step">шаг изменения числа для поля ввода</label>
        <v-input-text
          id="step"
          v-model="form.step"
          type="number"
          :step="0.1"
          :min="0"
        />
      </div>
      <div class="my-3">
        <label for="min">Минимальное значение для поля ввода</label>
        <v-input-text
          v-model="form.min"
          type="number"
          :min="0"
        />
      </div>
      <div class="my-3">
        <label for="max">Максимальное значение для поля ввода</label>
        <v-input-text
          v-model="form.max"
          type="number"
          :min="0"
        />
      </div>
      <div class="my-3">
        <label>
          условия для лучшего значения
          <span class="text-xs"> (больще значит лучше или наоборот) </span>
        </label>
        <v-buttons
          v-model="form.condition"
          :options="[
            { value: 'greater', title: 'больше' },
            { value: 'less', title: 'меньше' }
          ]"
          class="mt-2"
        />
      </div>
    </template>
    <div v-else-if="form.variantsValues">
      <label>вартианты значений</label>
      <v-tags v-model.trim="form.variantsValues" />
    </div>
    <div>
      <label>отображать на карточке товара </label>
      <v-buttons
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
    <div class="mt-2">
      <v-button :loading="loading">
        {{ type === 'create' ? 'создать характеристику' : 'сохранить' }}
      </v-button>
    </div>
  </form>
</template>
