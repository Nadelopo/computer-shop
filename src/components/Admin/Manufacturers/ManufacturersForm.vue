<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import { string } from '@/utils/validator'
import { VButton, VInputFile, VTextarea } from '@/components/UI'
import FormField from '@/components/FormField.vue'
import type { InputFileActions } from '@/components/UI/VInputFile/types'
import type { ManufacturerCreate } from '@/types/tables/manufacturers.types'

const props = defineProps<{
  loading?: boolean
  type: 'create' | 'update'
  formData?: ManufacturerCreate
}>()

const emit = defineEmits<{
  submit: [
    values: ManufacturerCreate,
    FileActions: InputFileActions | undefined,
    reset: () => void
  ]
}>()

const { values, handleSubmit, resetForm, setValues, setFieldValue } =
  useForm<ManufacturerCreate>({
    initialValues: {
      title: '',
      description: '',
      img: ''
    },
    validationSchema: {
      title: (v?: string) => string(v).required().valid(),
      description: (v?: string) => string(v).required().valid(),
      img: (v?: string) => string(v).required().valid()
    }
  })

if (props.type === 'update' && props.formData) {
  setValues(props.formData)
}

const inputFileRef = ref<InputFileActions>()

const submit = handleSubmit(() => {
  emit('submit', values, inputFileRef.value, resetForm)
})
</script>

<template>
  <form
    class="flex flex-col gap-y-2"
    @submit.prevent="submit"
  >
    <form-field
      name="title"
      label="Наименование"
    />
    <form-field
      name="description"
      label="Описание"
    >
      <v-textarea
        auto-grow
        :required="false"
        :model-value="values.description"
        @update:model-value="setFieldValue('description', $event)"
      />
    </form-field>
    <form-field
      name="img"
      label="Изображение"
    >
      <v-input-file
        ref="inputFileRef"
        :file-url="values.img"
        folder="manufacturers"
        :required="false"
        @update="
          setFieldValue('img', ($event.target as HTMLInputElement).value)
        "
        @delete="setFieldValue('img', props.formData?.img ?? '')"
      />
    </form-field>
    <div>
      <v-button :loading="loading">
        {{ type === 'create' ? 'добавить' : 'обновить' }}
      </v-button>
    </div>
  </form>
</template>
