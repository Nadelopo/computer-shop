<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import { string } from 'yup'
import { VInputFile, VButton } from '@/shared/components/UI'
import FormField from '@/shared/components/FormField.vue'
import type { InputFileActions } from '@/shared/components/UI/VInputFile/types'
import type { CategoryCreate } from '@/modules/categories'

const props = defineProps<{
  type: 'create' | 'update'
  loading: boolean
  formData?: CategoryCreate
}>()

const { values, handleSubmit, resetForm, setValues } = useForm<CategoryCreate>({
  initialValues: {
    img: '',
    enTitle: '',
    title: ''
  },
  validationSchema: {
    title: string().required(),
    enTitle: string().required(),
    img: string().required()
  }
})

if (props.type === 'update' && props.formData) {
  setValues(props.formData)
}

const emit = defineEmits<{
  submit: [
    values: CategoryCreate,
    FileActions: InputFileActions | undefined,
    reset: () => void
  ]
}>()

const inputFileRef = ref<InputFileActions>()

const reset = async () => {
  setTimeout(() => {
    resetForm()
  }, 10)
}

const submit = handleSubmit(() => {
  emit('submit', values, inputFileRef.value, reset)
})
</script>

<template>
  <form
    class="list__form"
    @submit.prevent="submit"
  >
    <FormField
      v-slot="{ setValue, id }"
      name="img"
      label="Изображение"
    >
      <VInputFile
        :id="id"
        ref="inputFileRef"
        :file-url="values.img"
        folder="manufacturers"
        :required="false"
        @update="setValue(($event.target as HTMLInputElement).value)"
        @delete="setValue(props.formData?.img ?? '')"
      />
    </FormField>
    <FormField
      name="enTitle"
      label="Наименование на английском"
    />
    <FormField
      name="title"
      label="Наименование на русском"
    />
    <div>
      <VButton
        type="submit"
        :loading="loading"
      >
        {{ type === 'create' ? 'создать категорию' : 'сохранить' }}
      </VButton>
    </div>
  </form>
</template>
