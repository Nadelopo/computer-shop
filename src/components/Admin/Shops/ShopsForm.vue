<script setup lang="ts">
import { ref, reactive, watchEffect } from 'vue'
import { vMaska, MaskInputOptions, MaskaDetail } from 'maska'
import { VInputText, VButton } from '@/components/UI'
import InputAddress from '@/components/InputAddress.vue'
import { useGeoSuggest, type LocationResult } from '@/utils/useGeoSuggest'
import type { ShopForm } from '@/components/Admin/Shops/types'

type Props = {
  loadingSubmit?: boolean
  type?: 'create' | 'update'
}

withDefaults(defineProps<Props>(), {
  type: 'create'
})
const model = defineModel<ShopForm>({ required: true })
const emit = defineEmits<{
  submit: []
}>()

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

const phoneMaskaCompleted = ref(false)

const onSubmit = () => {
  if (!maskaDetail.value.completed || !phoneMaskaCompleted.value) {
    return
  }
  emit('submit')
}

const locationResults = ref<LocationResult['results'] | null>(null)
watchEffect(async () => {
  const { data } = await useGeoSuggest({
    text: 'Ульяновск ' + model.value.address,
    type: 'house'
  })
  locationResults.value = data
  console.log(data)
})
</script>

<template>
  <form
    class="list__form"
    @submit.prevent="onSubmit"
  >
    <div>
      <input-address
        v-model="model.address"
        :location-results="locationResults"
        text="Адрес"
        @click-on-suggestion="model.address = $event"
      />
    </div>
    <div>
      <label>Часы работы</label>
      <v-input-text
        v-model="model.time"
        v-maska:[maskaOptions]="maskaDetail"
        placeholder="00:00 - 00:00"
        required
      />
    </div>
    <div>
      <label>Телефон</label>
      <v-input-text
        v-model="model.phone"
        type="tel"
        placeholder="7 (###) ###-##-##"
        required
        @update:model-value="(_, b) => (phoneMaskaCompleted = b?.completed!)"
      />
    </div>
    <div>
      <v-button :loading="loadingSubmit">
        {{ type === 'create' ? 'создать' : 'сохранить' }}
      </v-button>
    </div>
  </form>
</template>
