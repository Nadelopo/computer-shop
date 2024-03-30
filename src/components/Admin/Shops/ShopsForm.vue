<script setup lang="ts">
import { ref, reactive, watchEffect } from 'vue'
import { useForm } from 'vee-validate'
import { vMaska, type MaskInputOptions, type MaskaDetail } from 'maska'
import { useGeoSuggest, type LocationResult } from '@/utils/useGeoSuggest'
import { string } from '@/utils/validator'
import { VInputText, VButton } from '@/components/UI'
import InputAddress from '@/components/InputAddress.vue'
import FormField from '@/components/FormField.vue'
import type { ShopForm } from './types'

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
    address: (v?: string) => {
      return string(v).required().valid()
    },
    time: (v?: string) => {
      if (!v?.length) return 'Обязательное поле'
      if (v?.length !== 13) {
        return 'Введите данные в полном формате'
      }
      return true
    },
    phone: (v?: string) => string(v).required().phone().valid()
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
  }
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
    text: 'Ульяновск ' + values.address.trim(),
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
    <form-field
      v-slot="{ isError, value, setValue, fieldName }"
      name="address"
      label="Адрес"
    >
      <input-address
        :name="fieldName"
        :location-results="locationResults"
        :error="isError"
        placeholder="00:00 - 00:00"
        :model-value="value"
        @update:model-value="setValue($event.trim())"
        @click-on-suggestion="setValue($event)"
      />
    </form-field>
    <form-field
      v-slot="{ value, setValue, isError }"
      name="time"
      label="Часы работы"
    >
      <v-input-text
        v-maska:[maskaOptions]="maskaDetail"
        placeholder="00:00 - 00:00"
        :required="false"
        :error="isError"
        :model-value="value"
        @update:model-value="setValue($event)"
      />
    </form-field>

    <form-field
      v-slot="{ value, setValue, fieldName }"
      name="phone"
      label="Телефон"
    >
      <v-input-text
        :name="fieldName"
        :model-value="value"
        type="tel"
        placeholder="7 (###) ###-##-##"
        :required="false"
        @update:model-value="setValue($event)"
      />
    </form-field>
    <div>
      <v-button :loading="loadingSubmit">
        {{ type === 'create' ? 'создать' : 'сохранить' }}
      </v-button>
    </div>
  </form>
</template>
