<script setup lang="ts">
import { ref } from 'vue'
import {
  useManufacturersStore,
  AdminManufacturersList,
  AdminManufacturersForm,
  type ManufacturerCreate
} from '@/modules/manufacturers'
import type { InputFileActions } from '@/components/UI/VInputFile/types'
import type { Loading } from '@/types'

const { createManufacturer } = useManufacturersStore()

const loading = ref<Loading>('success')
const create = async (
  values: ManufacturerCreate,
  fileActions: InputFileActions | undefined,
  resetForm: () => void
) => {
  loading.value = 'loading'
  const { error: errorImage, url } = (await fileActions?.onSave()) || {}
  if (errorImage) {
    loading.value = 'error'
    return
  }
  const img = url ?? ''
  const data = await createManufacturer({ ...values, img })
  if (data) {
    resetForm()
  }
  fileActions?.clear()
  loading.value = 'success'
}
</script>

<template>
  <div>
    <AdminManufacturersForm
      :loading="loading === 'loading'"
      type="create"
      @submit="create"
    />
    <AdminManufacturersList />
  </div>
</template>
