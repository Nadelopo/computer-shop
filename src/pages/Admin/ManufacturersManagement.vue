<script setup lang="ts">
import { ref } from 'vue'
import { useManufacturersStore } from '@/stores/manufacturersStore'
import { VButton, VInputFile, VInputText } from '@/components/UI'
import ManufacturersList from '@/components/Admin/Manufacturers/ManufacturersList.vue'
import type { ManufacturerCreate } from '@/types/tables/manufacturers.types'
import type { InputFileActions } from '@/components/UI/VInputFile/types'

const { createManufacturer } = useManufacturersStore()

const form = ref<ManufacturerCreate>({
  title: '',
  img: '',
  description: ''
})

const inputFileRef = ref<InputFileActions>()
const create = async () => {
  const { error: errorImage, url } = (await inputFileRef.value?.onSave()) || {}
  if (errorImage) {
    return
  }
  if (url) {
    form.value.img = url
  }
  const data = await createManufacturer(form.value)
  if (data) {
    form.value = {
      title: '',
      img: '',
      description: ''
    }
  }
  inputFileRef.value?.clear()
}
</script>

<template>
  <div>
    <form
      class="list__form"
      @submit.prevent="create"
    >
      <div>
        <label>наименование</label>
        <v-input-text v-model.trim="form.title" />
      </div>
      <div>
        <label>описание</label>
        <v-input-text v-model.trim="form.description" />
      </div>
      <div>
        <label>наименование</label>
        <v-input-file
          ref="inputFileRef"
          :file-url="form.img"
          folder="manufacturers"
        />
      </div>
      <div>
        <v-button>добавить</v-button>
      </div>
    </form>
    <manufacturers-list />
  </div>
</template>
