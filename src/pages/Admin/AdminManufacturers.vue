<script setup lang="ts">
import { ref } from 'vue'
import { useManufacturersStore } from '@/stores/manufacturersStore'
import VInputFile from '@/components/UI/VInputFile.vue'
import VInputText from '@/components/UI/VInputText.vue'
import VButton from '@/components/UI/VButton.vue'
import ManufacturersList from '@/components/Admin/ManufacturersList.vue'
import type { ManufacturerCreate } from '@/types/tables/manufacturers.types'

const { createManufacturer } = useManufacturersStore()

const form = ref<ManufacturerCreate>({
  title: '',
  img: '',
  description: ''
})

const create = async () => {
  const data = await createManufacturer(form.value)
  if (data) {
    form.value = {
      title: '',
      img: '',
      description: ''
    }
  }
}
</script>

<template>
  <div>
    <form class="list__form" @submit.prevent="create">
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
        <v-input-file v-model.trim="form.img" folder="manufacturers" />
      </div>
      <div>
        <v-button>добавить</v-button>
      </div>
    </form>
    <ManufacturersList />
  </div>
</template>
