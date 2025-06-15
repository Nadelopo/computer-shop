<script setup lang="ts">
import { ref } from 'vue'
import {
  useManufacturersStore,
  ManufacturerEditor,
  type ManufacturerCreate
} from '@/modules/manufacturers'
import ManufacturersList from './components/ManufacturersList.vue'
import type { InputFileActions } from '@/shared/components/UI/VInputFile/types'
import type { Loading } from '@/shared/types'

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
    <ManufacturerEditor
      :loading="loading === 'loading'"
      type="create"
      @submit="create"
    />
    <ManufacturersList />
  </div>
</template>
