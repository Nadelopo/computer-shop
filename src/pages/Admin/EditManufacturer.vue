<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useManufacturersStore } from '@/stores/manufacturersStore'
import VInputText from '@/components/UI/VInputText.vue'
import VInputFile from '@/components/UI/VInputFile.vue'
import VButton from '@/components/UI/VButton.vue'
import VLoader from '@/components/UI/VLoader.vue'
import type { ManufacturerUpdate } from '@/types/tables/manufacturers.types'

const route = useRoute()
const router = useRouter()

const { getManufacturer, updateManufacturer } = useManufacturersStore()

const manufactuerId = Number(route.params.id)
const manufacturer = ref<ManufacturerUpdate | null>(null)

const loading = ref<'success' | 'loading'>('loading')

onBeforeMount(async () => {
  const data = await getManufacturer(manufactuerId)
  if (data) {
    manufacturer.value = {
      title: data.title,
      description: data.description,
      img: data.img
    }
  }
  loading.value = 'success'
})

const update = async () => {
  if (manufacturer.value) {
    loading.value = 'loading'
    await updateManufacturer(manufactuerId, manufacturer.value)
    router.push({
      name: 'AdminManufacturers'
    })
  }
}
</script>

<template>
  <div>
    <div v-if="loading === 'success'" class="container">
      <form
        v-if="manufacturer"
        class="list__form pt-10"
        @submit.prevent="update"
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
              v-model="manufacturer.img"
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
    <div v-else class="h-screen flex justify-center item-center">
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
