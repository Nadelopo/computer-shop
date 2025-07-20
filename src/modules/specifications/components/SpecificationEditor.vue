<script setup lang="ts">
import { ref, unref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useForm } from 'vee-validate'
import { number, string } from 'yup'
import { useCategoriesStore } from '@/modules/categories'
import { VButtons, VInput, VButton, VSelect, VTags } from '@/shared/components/UI'
import FormField from '@/shared/components/FormField.vue'
import type {
  CategorySpecificationCreate,
  CategorySpecificationForm
} from '@/modules/categorySpecifications'

type FormData = Omit<CategorySpecificationForm, 'categoryId' | 'title' | 'enTitle'>

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
    <FormField
      v-slot="{ value, setValue, isError }"
      type="number"
      name="categoryId"
      label="Категория"
      hide-errors
    >
      <VSelect
        class="my-2"
        :options="categories.map((e) => ({ value: e.id, title: e.title }))"
        :required="false"
        :is-error="isError"
        :model-value="value"
        @update:model-value="setValue($event)"
      />
    </FormField>
    <FormField
      name="title"
      label="Наименование"
    />
    <FormField
      name="enTitle"
      label="Наименование на английском"
    />
    <div>
      <label for="units">Единицы измерения</label>
      <VInput
        id="units"
        v-model.trim="form.units"
        :required="false"
      />
    </div>
    <div>
      <div>тип поля</div>
      <VButtons
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
        <VInput
          id="step"
          v-model="form.step"
          type="number"
          :step="0.1"
          :min="0"
        />
      </div>
      <div class="my-3">
        <label for="min">Минимальное значение для поля ввода</label>
        <VInput
          v-model="form.min"
          type="number"
          :min="0"
        />
      </div>
      <div class="my-3">
        <label for="max">Максимальное значение для поля ввода</label>
        <VInput
          v-model="form.max"
          type="number"
          :min="0"
        />
      </div>
      <div class="my-3">
        <div>
          условия для лучшего значения
          <span class="text-xs"> (больще значит лучше или наоборот) </span>
        </div>
        <VButtons
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
      <div>вартианты значений</div>
      <VTags v-model.trim="form.variantsValues" />
    </div>
    <div>
      <div>отображать на карточке товара</div>
      <VButtons
        v-model="form.visible"
        class="mt-2"
        :options="[
          { value: true, title: 'да' },
          { value: false, title: 'нет' }
        ]"
      />
    </div>
    <div v-if="props.type === 'create'">
      <div>задать значение по умолчанию для товаров</div>
      <VButtons
        v-model="setInitialValue"
        :options="[
          { value: true, title: 'да' },
          { value: false, title: 'нет' }
        ]"
        class="mt-2"
      />
    </div>
    <div class="mt-2">
      <VButton
        type="submit"
        :loading="loading"
      >
        {{ type === 'create' ? 'создать характеристику' : 'сохранить' }}
      </VButton>
    </div>
  </form>
</template>
