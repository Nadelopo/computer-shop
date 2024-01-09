<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VInputFile, VInputText, VTextarea } from '@/components/UI'
import type { InputFileActions } from '@/components/UI/VInputFile/types'
import type { ManufacturerCreate } from '@/types/tables/manufacturers.types'

defineProps<{
  loading?: boolean
  type: 'create' | 'update'
}>()

const emit = defineEmits<{
  submit: [FileActions: InputFileActions | undefined]
}>()

const form = defineModel<ManufacturerCreate>({
  required: true
})

const inputFileRef = ref<InputFileActions>()
</script>

<template>
  <form
    class="list__form"
    @submit.prevent="emit('submit', inputFileRef)"
  >
    <div>
      <label>наименование</label>
      <v-input-text v-model.trim="form.title" />
    </div>
    <div>
      <label>описание</label>
      <v-textarea
        v-if="form.description !== undefined"
        v-model="form.description"
        auto-grow
      />
    </div>
    <div>
      <label>изображение</label>
      <v-input-file
        ref="inputFileRef"
        :file-url="form.img"
        folder="manufacturers"
      />
    </div>
    <div>
      <v-button :loading="loading">
        {{ type === 'create' ? 'добавить' : 'обновить' }}
      </v-button>
    </div>
  </form>
</template>
