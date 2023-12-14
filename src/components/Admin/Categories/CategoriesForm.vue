<script setup lang="ts">
import { ref } from 'vue'
import { VInputText, VInputFile, VButton } from '@/components/UI'
import type { InputFileActions } from '@/components/UI/VInputFile/types'
import type {
  CategoryCreate,
  CategoryUpdate
} from '@/types/tables/categories.types'

defineProps<{
  type: 'create' | 'update'
  loading: boolean
}>()

const form = defineModel<CategoryCreate | CategoryUpdate>({ required: true })

const emit = defineEmits<{
  submit: [FileActions: InputFileActions | undefined]
}>()

const inputFileRef = ref<InputFileActions>()
</script>

<template>
  <form
    class="list__form"
    @submit.prevent="emit('submit', inputFileRef)"
  >
    <div>
      <label>загрузить изображение</label>
      <v-input-file
        ref="inputFileRef"
        :file-url="form.img"
        class="mt-4"
        folder="categories"
      />
    </div>
    <div>
      <label>наименование на английском</label>
      <v-input-text v-model="form.enTitle" />
    </div>
    <div>
      <label>наименование на русском</label>
      <v-input-text v-model="form.title" />
    </div>
    <div>
      <v-button :loading="loading">
        {{ type === 'create' ? 'создать категорию' : 'сохранить' }}
      </v-button>
    </div>
  </form>
</template>
