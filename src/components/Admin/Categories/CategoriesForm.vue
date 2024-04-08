<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import { string } from '@/utils/validator'
import { VInputFile, VButton } from '@/components/UI'
import FormField from '@/components/FormField.vue'
import type { InputFileActions } from '@/components/UI/VInputFile/types'
import type { CategoryCreate } from '@/types/tables/categories.types'

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
    title: (v?: string) => string(v).required().valid(),
    enTitle: (v?: string) => string(v).required().valid(),
    img: (v?: string) => string(v).required().valid()
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
    <form-field
      v-slot="{ setValue }"
      name="img"
      label="Изображение"
    >
      <v-input-file
        ref="inputFileRef"
        :file-url="values.img"
        folder="manufacturers"
        :required="false"
        @update="setValue(($event.target as HTMLInputElement).value)"
        @delete="setValue(props.formData?.img ?? '')"
      />
    </form-field>
    <form-field
      name="enTitle"
      label="Наименование на английском"
    />
    <form-field
      name="title"
      label="Наименование на русском"
    />
    <!-- </div> -->
    <!-- <div> -->
    <!-- <label>наименование на английском</label>
      <v-input-text v-model="form.enTitle" /> -->
    <!-- </div> -->
    <!-- <div>
      <label>наименование на русском</label>
      <v-input-text v-model="form.title" />
    </div> -->
    <div>
      <v-button :loading="loading">
        {{ type === 'create' ? 'создать категорию' : 'сохранить' }}
      </v-button>
    </div>
  </form>
</template>
