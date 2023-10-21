<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useManufacturersStore } from '@/stores/manufacturersStore'
import { VButton, VLoader, VInputText, VInputFile } from '@/components/UI'
import type { ManufacturerUpdate } from '@/types/tables/manufacturers.types'
import type { Loading } from '@/types'
import type { InputFileActions } from '@/components/UI/VInputFile/types'

const route = useRoute()
const router = useRouter()

const { getManufacturer, updateManufacturer } = useManufacturersStore()

const manufactuerId = Number(route.params.id)
const manufacturer = ref<ManufacturerUpdate | null>(null)

const loading = ref<Loading>('loading')

onBeforeMount(async () => {
  const { data, error } = await getManufacturer(manufactuerId)
  if (error) {
    loading.value = 'error'
    return
  }
  manufacturer.value = {
    title: data.title,
    description: data.description,
    img: data.img
  }
  loading.value = 'success'
})

const inputFileRef = ref<InputFileActions>()
const save = async () => {
  if (!manufacturer.value) return
  const { error: errorImage, url } = (await inputFileRef.value?.onSave()) || {}
  if (errorImage) {
    loading.value = 'error'
    return
  }
  if (url) {
    manufacturer.value.img = url
  }
  loading.value = 'loading'
  const { error } = await updateManufacturer(manufactuerId, manufacturer.value)
  if (error) {
    loading.value = 'error'
    return
  }
  router.push({
    name: 'AdminManufacturers'
  })
}
</script>

<template>
  <div>
    <div
      v-if="loading === 'success'"
      class="container"
    >
      <form
        v-if="manufacturer"
        class="list__form pt-10"
        @submit.prevent="save"
      >
        <div>
          <label>наименование</label>
          <v-input-text v-model="manufacturer.title" />
        </div>
        <div>
          <label>описание</label>
          <div>
            <textarea v-model="manufacturer.description" />
          </div>
        </div>
        <div>
          <label>изображение</label>
          <div>
            <v-input-file
              ref="inputFileRef"
              :file-url="manufacturer.img"
              folder="manufacturers"
              :required="false"
            />
          </div>
        </div>
        <div>
          <v-button> сохранить </v-button>
        </div>
      </form>
      <div class="mt-4">
        <v-button
          @click="
            $router.push({
              name: 'AdminManufacturers'
            })
          "
        >
          назад
        </v-button>
      </div>
    </div>
    <div
      v-else
      class="h-screen flex justify-center item-center"
    >
      <v-loader />
    </div>
  </div>
</template>

<style scoped lang="sass">
textarea
  width: 100%
  min-height: 50px
  background: inherit
</style>
