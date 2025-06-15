<script setup lang="ts">
import { ref, reactive, watchEffect } from 'vue'
import { useForm } from 'vee-validate'
import { string } from 'yup'
import { vMaska } from 'maska/vue'
import { type MaskInputOptions, type MaskaDetail } from 'maska'
import { useGeoSuggest, type LocationResult } from '@/shared/utils/useGeoSuggest'
import { VInputText, VButton } from '@/shared/components/UI'
import FormField from '@/shared/components/FormField.vue'
import InputAddress from '@/shared/components/InputAddress.vue'
import type { ShopForm } from '@/modules/shops'

type Props = {
  loadingSubmit?: boolean
  type?: 'create' | 'update'
  formData?: ShopForm
}

const props = withDefaults(defineProps<Props>(), {
  type: 'create'
})
const emit = defineEmits<{
  submit: [values: ShopForm, reset: () => void]
}>()

const { values, handleSubmit, resetForm, setValues } = useForm<ShopForm>({
  initialValues: {
    address: '',
    time: '',
    phone: ''
  },
  validationSchema: {
    address: string().required(),
    time: string()
      .required()
      .test('time', 'Введите данные в полном формате', (v) => {
        if (v.length !== 13) return false
        return true
      }),
    phone: string().required().min(10)
  }
})

if (props.type === 'update' && props.formData) {
  setValues(props.formData)
}

const maskaOptions: MaskInputOptions = reactive({
  mask: '2#:5# - 2#:5#',
  eager: true,
  tokens: {
    '2': { pattern: /[0-2]/ },
    '5': { pattern: /[0-5]/ }
  },
  onMaska: (detail) => (maskaDetail.value = detail)
})

const maskaDetail = ref<MaskaDetail>({
  completed: false,
  masked: '',
  unmasked: ''
})

const reset = async () => {
  resetForm()
  setTimeout(() => {
    resetForm()
  }, 10)
}

const onSubmit = handleSubmit(() => {
  emit('submit', values, reset)
})

const locationResults = ref<LocationResult['results'] | null>(null)
watchEffect(async () => {
  const { data } = await useGeoSuggest({
    text: `Ульяновск ${values.address.trim()}`,
    type: 'house'
  })
  locationResults.value = data
})
</script>

<template>
  <form
    class="flex flex-col gap-y-2"
    @submit.prevent="onSubmit"
  >
    <FormField
      v-slot="{ isError, value, setValue, fieldName, id }"
      name="address"
      label="Адрес"
    >
      <InputAddress
        :id="id"
        :name="fieldName"
        :location-results="locationResults"
        :error="isError"
        placeholder="00:00 - 00:00"
        :model-value="value"
        @update:model-value="setValue($event.trim())"
        @click-on-suggestion="setValue($event)"
      />
    </FormField>
    <FormField
      v-slot="{ value, setValue, isError, id }"
      name="time"
      label="Часы работы"
    >
      <VInputText
        :id="id"
        v-maska="maskaOptions"
        name="time"
        placeholder="00:00 - 00:00"
        :required="false"
        :error="isError"
        :model-value="value"
        @update:model-value="setValue($event)"
      />
    </FormField>

    <FormField
      v-slot="{ value, setValue, fieldName, id }"
      name="phone"
      label="Телефон"
    >
      <VInputText
        :id="id"
        :name="fieldName"
        :model-value="value"
        type="tel"
        placeholder="7 (###) ###-##-##"
        :required="false"
        @update:model-value="setValue($event)"
      />
    </FormField>
    <div>
      <VButton
        type="submit"
        :loading="loadingSubmit"
      >
        {{ type === 'create' ? 'создать' : 'сохранить' }}
      </VButton>
    </div>
  </form>
</template>
