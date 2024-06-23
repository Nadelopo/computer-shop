<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { useToast } from 'vue-toastification'
import { deleteOneById, getAll } from '@/db/queries/tables'
import { VConfirm, VLoader, VTable } from '@/components/UI'
import { formatPhoneNumber } from '@/utils/formatPhone'
import { formatTime } from '@/utils/formatTime'
import AppLink from '@/components/AppLink.vue'
import ActionIcon from '@/components/ActionIcon.vue'
import { EditSvg, TrashSvg } from '@/assets/icons'
import type { Loading } from '@/types'
import type { ShopRead } from '@/types/tables/shops.types'

const shops = defineModel<ShopRead[]>({ required: true })
const loadingShops = ref<Loading>('loading')
onBeforeMount(async () => {
  const { data, error } = await getAll('shops')
  if (error) {
    loadingShops.value = 'error'
    return
  }
  shops.value = data
  loadingShops.value = 'success'
})

const toast = useToast()
const loadingRemove = ref<Loading>('loading')
const currentRemoveShopId = ref(0)
const remove = async (id: number) => {
  currentRemoveShopId.value = id
  loadingRemove.value = 'loading'
  const { error } = await deleteOneById('shops', id)
  if (error) {
    loadingRemove.value = 'error'
    toast.error('ошибка при удалении')
    return
  }
  shops.value = shops.value.filter((e) => e.id !== id)
  loadingRemove.value = 'success'
}
</script>

<template>
  <v-table
    class="mt-6"
    line
  >
    <template #header> Магазины </template>
    <div
      v-if="loadingShops === 'loading'"
      class="p-4"
    >
      <v-loader />
    </div>
    <template v-else>
      <thead>
        <tr>
          <th>Адрес</th>
          <th>Телефон</th>
          <th>Время</th>
          <th width="1%">Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="shop in shops"
          :key="shop.id"
        >
          <td>{{ shop.address }}</td>
          <td>{{ formatPhoneNumber(shop.phone) }}</td>
          <td> {{ formatTime(shop.timeStart, shop.timeEnd) }} </td>
          <td>
            <div class="flex">
              <app-link
                :to="{
                  name: 'EditShop',
                  params: {
                    id: shop.id
                  }
                }"
              >
                <action-icon
                  :svg="EditSvg"
                  paint-type="stroke"
                />
              </app-link>
              <v-confirm
                v-slot="{ openModal }"
                :message="'Вы точно хотите удалить?'"
                @ok="remove(shop.id)"
              >
                <action-icon
                  :svg="TrashSvg"
                  variant="danger"
                  :loading="
                    loadingRemove === 'loading' &&
                    currentRemoveShopId === shop.id
                  "
                  @click="openModal"
                />
              </v-confirm>
            </div>
          </td>
        </tr>
      </tbody>
    </template>
  </v-table>
</template>
