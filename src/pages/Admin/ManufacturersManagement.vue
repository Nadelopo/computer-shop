<script setup lang="ts">
import { ref } from 'vue'
import { useManufacturersStore } from '@/stores/manufacturersStore'
import ManufacturersList from '@/components/Admin/Manufacturers/ManufacturersList.vue'
import ManufacturersForm from '@/components/Admin/Manufacturers/ManufacturersForm.vue'
import type { ManufacturerCreate } from '@/types/tables/manufacturers.types'
import type { InputFileActions } from '@/components/UI/VInputFile/types'
import type { Loading } from '@/types'

const { createManufacturer } = useManufacturersStore()

const form = ref<ManufacturerCreate>({
  title: '',
  img: '',
  description: ''
})

const loading = ref<Loading>('success')
const create = async (fileActions: InputFileActions | undefined) => {
  loading.value = 'loading'
  const { error: errorImage, url } = (await fileActions?.onSave()) || {}
  if (errorImage) {
    loading.value = 'error'
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
  fileActions?.clear()
  loading.value = 'success'
}
</script>

<template>
  <div>
    <manufacturers-form
      v-model="form"
      :loading="loading === 'loading'"
      type="create"
      @submit="create"
    />
    <manufacturers-list />
  </div>
</template>
