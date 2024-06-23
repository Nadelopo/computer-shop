<script setup lang="ts">
import { ref } from 'vue'
import { useManufacturersStore } from '@/stores/manufacturersStore'
import ManufacturersList from '@/components/Admin/Manufacturers/ManufacturersList.vue'
import ManufacturersForm from '@/components/Admin/Manufacturers/ManufacturersForm.vue'
import type { ManufacturerCreate } from '@/types/tables/manufacturers.types'
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
    <manufacturers-form
      :loading="loading === 'loading'"
      type="create"
      @submit="create"
    />
    <manufacturers-list />
  </div>
</template>
