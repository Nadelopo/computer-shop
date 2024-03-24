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

// const inputFileRef = ref<InputFileActions>()
const loadingSave = ref<Loading>('success')
const save = async (fileActions: InputFileActions | undefined) => {
  if (!form.value) return
  loadingSave.value = 'loading'
  const { error: errorImage, url } = (await fileActions?.onSave()) || {}
  if (errorImage) {
    loadingSave.value = 'error'
    return
  }
  if (url) {
    form.value.img = url
  }
  const { error } = await updateManufacturer(manufactuerId, form.value)
  if (error) {
    loadingGet.value = 'error'
    return
  }
  router.customPush({
    name: 'AdminManufacturers'
  })
}
</script>

<template>
  <div class="container">
    <template v-if="loadingGet === 'success' && form">
      <manufacturers-form
        v-model="form"
        :loading="loadingSave === 'loading'"
        type="update"
        class="pt-10"
        @submit="save"
      />
      <v-button
        class="mt-4"
        @click="
          router.customPush({
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
