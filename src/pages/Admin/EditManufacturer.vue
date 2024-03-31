<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useManufacturersStore } from '@/stores/manufacturersStore'
import { useCustomRouter } from '@/utils/useCustomRouter'
import { VButton, VLoader } from '@/components/UI'
import ManufacturersForm from '@/components/Admin/Manufacturers/ManufacturersForm.vue'
import type { ManufacturerCreate } from '@/types/tables/manufacturers.types'
import type { Loading } from '@/types'
import type { InputFileActions } from '@/components/UI/VInputFile/types'

const route = useRoute()
const router = useCustomRouter()

const { getManufacturer, updateManufacturer } = useManufacturersStore()

const manufactuerId = Number(route.params.id)
const form = ref<ManufacturerCreate>()

const loadingGet = ref<Loading>('loading')
onBeforeMount(async () => {
  const { data, error } = await getManufacturer(manufactuerId)
  if (error) {
    loadingGet.value = 'error'
    return
  }
  form.value = {
    title: data.title,
    description: data.description,
    img: data.img
  }
  loadingGet.value = 'success'
})

const loadingSave = ref<Loading>('success')
const save = async (
  values: ManufacturerCreate,
  fileActions: InputFileActions | undefined
) => {
  loadingSave.value = 'loading'
  const { error: errorImage, url } = (await fileActions?.onSave()) || {}
  if (errorImage) {
    loadingSave.value = 'error'
    return
  }
  const img = url ?? ''
  const { error } = await updateManufacturer(manufactuerId, { ...values, img })
  if (error) {
    loadingGet.value = 'error'
    return
  }
  router.push({
    name: 'AdminManufacturers'
  })
}
</script>

<template>
  <div class="container">
    <template v-if="loadingGet === 'success' && form">
      <manufacturers-form
        :form-data="form"
        :loading="loadingSave === 'loading'"
        type="update"
        class="pt-10"
        @submit="save"
      />
      <v-button
        class="mt-4"
        @click="
          router.push({
            name: 'AdminManufacturers',
            params: { id: manufactuerId }
          })
        "
      >
        назад
      </v-button>
    </template>
    <div
      v-else
      class="h-screen flex justify-center item-center"
    >
      <v-loader />
    </div>
  </div>
</template>
