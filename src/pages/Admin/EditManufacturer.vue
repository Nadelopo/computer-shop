<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import VInputText from '@/components/UI/VInputText.vue'
import VInputFile from '@/components/UI/VInputFile.vue'
import VButton from '@/components/UI/VButton.vue'
import { useManufacturersStore } from '@/stores/manufacturersStore'
import type { ManufacturerUpdate } from '@/types/tables/manufacturers.types'

const { getManufacturer, updateManufacturer } = useManufacturersStore()

const manufactuerId = Number(useRoute().params.id)

const data = await getManufacturer(manufactuerId)
const manufacturer = ref<ManufacturerUpdate | null>(null)

if (data) {
  manufacturer.value = {
    title: data.title,
    description: data.description,
    img: data.img
  }
}

const router = useRouter()
const update = async () => {
  if (manufacturer.value) {
    await updateManufacturer(manufactuerId, manufacturer.value)
    router.push({
      name: 'AdminManufacturers'
    })
  }
}
</script>

<template>
  <div>
    <div class="container">
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
  </div>
</template>

<style scoped lang="sass">
textarea
  width: 100%
  min-height: 50px
  background: inherit
</style>
