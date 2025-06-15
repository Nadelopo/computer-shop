<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { supabase, removeFromStorage } from '@/shared/api'
import { useManufacturersStore } from '@/modules/manufacturers'
import { VConfirm, VTable } from '@/components/UI'
import ActionIcon from '@/components/ActionIcon.vue'
import { EditSvg, TrashSvg } from '@/assets/icons'
import type { Loading } from '@/types'

const { manufacturers } = storeToRefs(useManufacturersStore())

const toast = useToast()

const loadingRemove = ref<Loading>('loading')
const currentRemoveManufacturerId = ref(0)

const remove = async (id: number, img: string) => {
  currentRemoveManufacturerId.value = id
  loadingRemove.value = 'loading'

  const { error } = await supabase.from('manufacturers').delete().eq('id', id)
  if (error) {
    loadingRemove.value = 'error'
    toast.error('ошибка при удалении')
    return
  }
  manufacturers.value = manufacturers.value.filter((e) => e.id !== id)

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
  <VTable
    class="mt-6"
    line
  >
    <template #header> Производители</template>
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
          <div class="flex">
            <ActionIcon
              tag="a"
              :to="{
                name: 'EditManufacturer',
                params: {
                  id: manufacturer.id
                }
              }"
              :svg="EditSvg"
              paint-type="stroke"
            />
            <VConfirm
              v-slot="{ openModal }"
              :message="`Вы точно хотите удалить производителя - ${manufacturer.title}`"
              @ok="remove(manufacturer.id, manufacturer.img)"
            >
              <ActionIcon
                :svg="TrashSvg"
                variant="danger"
                :loading="
                  loadingRemove === 'loading' &&
                  currentRemoveManufacturerId === manufacturer.id
                "
                @click="openModal"
              />
            </VConfirm>
          </div>
        </td>
      </tr>
    </tbody>
  </VTable>
</template>
