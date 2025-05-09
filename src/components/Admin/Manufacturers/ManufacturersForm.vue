<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import { string } from 'yup'
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
      title: string().required(),
      description: string().required(),
      img: string().required()
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
    <FormField
      name="title"
      label="Наименование"
    />
    <FormField
      v-slot="{ id }"
      name="description"
      label="Описание"
    >
      <VTextarea
        :id="id"
        auto-grow
        :required="false"
        :model-value="values.description"
        @update:model-value="setFieldValue('description', $event)"
      />
    </FormField>
    <FormField
      v-slot="{ id }"
      name="img"
      label="Изображение"
    >
      <VInputFile
        :id="id"
        ref="inputFileRef"
        :file-url="values.img"
        folder="manufacturers"
        :required="false"
        @update="
          setFieldValue('img', ($event.target as HTMLInputElement).value)
        "
        @delete="setFieldValue('img', props.formData?.img ?? '')"
      />
    </FormField>
    <div>
      <VButton
        type="submit"
        :loading="loading"
      >
        {{ type === 'create' ? 'добавить' : 'обновить' }}
      </VButton>
    </div>
  </form>
</template>
