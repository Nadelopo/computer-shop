<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { useManufacturersStore } from '@/stores/manufacturersStore'
import { VButton, VConfirm, VTable } from '@/components/UI'
import { deleteOneById } from '@/db/queries/tables'
import { removeFromStorage } from '@/db/queries/storage'
import type { Loading } from '@/types'

const { manufacturers } = storeToRefs(useManufacturersStore())

const toast = useToast()
const loadingRemove = ref<Loading>('loading')
const currentRemoveManufacturerId = ref(0)
const remove = async (id: number, img: string) => {
  currentRemoveManufacturerId.value = id
  loadingRemove.value = 'loading'

  const { data, error } = await deleteOneById('manufacturers', id)
  if (error) {
    loadingRemove.value = 'error'
    toast.error('ошибка при удалении')
    return
  }
  manufacturers.value = manufacturers.value.filter((e) => e.id !== data.id)

  const { data: imageData } = await removeFromStorage('manufacturers', img)

  if (!imageData?.length) {
    loadingRemove.value = 'error'
    toast.error('ошибка при удалении изображение')
    return
  }
  loadingRemove.value = 'success'
}
</script>

<template>
  <v-table
    class="mt-6"
    line
  >
    <thead>
      <tr>
        <th>Наименование</th>
        <th>Описание</th>
        <th>Изображение</th>
        <th>Действия</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="manufacturer in manufacturers"
        :key="manufacturer.id"
      >
        <td>{{ manufacturer.title }}</td>
        <td>{{ manufacturer.description }}</td>
        <td>
          <img
            class="max-w-[120px]"
            :src="manufacturer.img"
            alt=""
          />
        </td>
        <td>
          <v-button class="mb-2">
            <router-link
              :to="{
                name: 'EditManufacturer',
                params: {
                  id: manufacturer.id
                }
              }"
            >
              изменить
            </router-link>
          </v-button>
          <v-confirm
            :message="
              'Вы точно хотите удалить производителя - ' + manufacturer.title
            "
            :loading="
              loadingRemove === 'loading' &&
              currentRemoveManufacturerId === manufacturer.id
            "
            type="danger"
            label="удалить"
            @ok="remove(manufacturer.id, manufacturer.img)"
          />
        </td>
      </tr>
    </tbody>
  </v-table>
</template>
