<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useManufacturersStore } from '@/stores/manufacturersStore'
import VInputFile from '@/components/UI/VInputFile.vue'
import VInputText from '@/components/UI/VInputText.vue'
import VButton from '@/components/UI/VButton.vue'
import type { ImanufacturerCU } from '@/types/tables'

const { manufacturers } = storeToRefs(useManufacturersStore())
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
    <div class="list">
      <router-link
        v-for="manufacturer in manufacturers"
        :key="manufacturer.id"
        :to="{ name: 'EditManufacturer', params: { id: manufacturer.id } }"
        class="wrapper"
      >
        <div>{{ manufacturer.title }}</div>
        <div><img :src="manufacturer.img" alt="" /></div>
      </router-link>
    </div>
  </div>
</template>

<style scoped lang="sass">

.list
  margin-top: 100px
  display: grid
  grid-template-columns: repeat(8, 1fr)
  gap: 30px
  .wrapper
    display: grid
    grid-template-rows: auto 1fr
    justify-items: center
    align-items: center
    cursor: pointer
    box-shadow: 0 0 6px 3px rgb(1,1,1,0.1)
    padding: 12px 0
    border-radius: 6px
    transition: .2s
    &:hover
      box-shadow: 0 0 10px 3px rgb(1,1,1,0.2)
</style>
