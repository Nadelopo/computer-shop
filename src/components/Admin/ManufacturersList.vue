<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useManufacturersStore } from '@/stores/manufacturersStore'
import { VButton, VConfirm } from '../UI'
import { ref } from 'vue'
import type { Loading } from '@/types'
import { deleteOneById } from '@/utils/queries/db'
import { removeFromStorage } from '@/utils/queries/storage'
import { useToast } from 'vue-toastification'

const { manufacturers } = storeToRefs(useManufacturersStore())

const toast = useToast()
const loading = ref<Loading>('loading')
const remove = async (id: number, img: string) => {
  loading.value = 'loading'

  const { data, error } = await deleteOneById('manufacturers', id)
  if (error) {
    loading.value = 'error'
    toast.error('ошибка при удалении')
    return
  }
  manufacturers.value = manufacturers.value.filter((e) => e.id !== data.id)

  const { data: imageData } = await removeFromStorage('manufacturers', img)

  if (!imageData?.length) {
    loading.value = 'error'
    toast.error('ошибка при удалении изображение')
    return
  }
  loading.value = 'success'
}
</script>

<template>
  <div>
    <div class="list">
      <div
        v-for="manufacturer in manufacturers"
        :key="manufacturer.id"
        class="wrapper"
      >
        <div>{{ manufacturer.title }}</div>
        <div>
          <img
            :src="manufacturer.img"
            alt=""
          />
        </div>
        <v-button
          class="edit"
          @click="
            $router.push({
              name: 'EditManufacturer',
              params: { id: manufacturer.id }
            })
          "
        >
          edit
        </v-button>
        <v-confirm
          class="delete"
          label="удалить"
          title="Подтвердите действие"
          :message="`Вы хотите удалить производителя - ${manufacturer.title}?`"
          type="danger"
          @ok="remove(manufacturer.id, manufacturer.img)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="sass">
.list
  margin-top: 100px
  display: grid
  grid-template-columns: repeat(6, 250px)
  gap: 30px
  @media (width <= 2000px)
    grid-template-columns: repeat(4, 250px)
    @media (width <= 1450px)
      grid-template-columns: repeat(3, 250px)
      @media (width <= 1160px)
        grid-template-columns: repeat(2, 250px)
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
    position: relative
    &:hover
      box-shadow: 0 0 10px 3px rgb(1,1,1,0.2)
      backdrop-filter: brightness(0.5)
      img
        filter: brightness(0.5)
      button
        opacity: 1
    img
      transition: .2s
      max-height: 80px
    button
      transition: .2s
      position: absolute
      opacity: 0
      &.edit
        top: 10%
      &.delete
        top: calc(90% - 36px)
</style>
