<script setup lang="ts">
import { ref } from 'vue'
import { useManufacturersStore } from '@/stores/manufacturersStore'
import InputFile from '@/components/UI/InputFile.vue'
import InputText from '@/components/UI/InputText.vue'
import type { ImanufacturerCU } from '@/stores/manufacturersStore/types'

const { createManufacturer } = useManufacturersStore()

const form = ref<ImanufacturerCU>({
  title: '',
  img: '',
  description: '',
})

const create = async () => {
  const { data } = await createManufacturer(form.value)
  if (data) {
    form.value = {
      title: '',
      img: '',
      description: '',
    }
  }
}
</script>

<template>
  <form class="list__form" @submit.prevent="create">
    <div>
      <label>наименование</label>
      <InputText v-model.trim="form.title" />
    </div>
    <div>
      <label>описание</label>
      <InputText v-model.trim="form.description" />
    </div>
    <div>
      <label>наименование</label>
      <InputFile v-model.trim="form.img" folder="manufacturers" />
    </div>
    <div>
      <button class="btn">добавить</button>
    </div>
  </form>
</template>
