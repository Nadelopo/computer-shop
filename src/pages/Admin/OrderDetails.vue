<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue'
import { useToast } from 'vue-toastification'
import { getOneById, updateOneById } from '@/db/queries/tables'
import { useUserStore } from '@/stores/userStore'
import { useCustomRoute } from '@/utils/customRouter'
import { useOrders } from '@/utils/useOrders'
import { VSelect, VButton, VTable, VLoader } from '@/components/UI'
import AppLink from '@/components/AppLink.vue'
import { formatPrice } from '@/utils/formatPrice'
import type { Loading } from '@/types'
import type { OrderReadWithDetails } from '@/types/tables/orders.types'

const route = useCustomRoute('AdminOrderDetails')
const orderId = Number(route.params.id)

const { isUserAuthenticated } = useUserStore()
const loading = ref<Loading>('loading')
const order = ref<OrderReadWithDetails>()
onBeforeMount(async () => {
  const user = await isUserAuthenticated()
  if (!user) return
  const { data, error } = await getOneById(
    'orders',
    orderId,
    '*, ordered_products(*, products(id, title, img, categories(id, enTitle)))'
  )
  if (error) {
    loading.value = 'loading'
    return
  }
  order.value = data
  loading.value = 'success'
})

const { paymentStatusMappings, statusMappings } = useOrders()

const statusOptions = computed(() => {
  const entries = Object.entries(statusMappings)
  return entries.map(([value, title]) => ({
    title,
    value: value as keyof typeof statusMappings
  }))
})

const paymentStatusOptions = computed(() => {
  const entries = Object.entries(paymentStatusMappings)
  return entries.map(([value, title]) => ({
    title,
    value: value as keyof typeof paymentStatusMappings
  }))
})

const updateOrder = async () => {
  const { error } = await updateOneById('orders', orderId, {
    status: order.value?.status,
    paymentStatus: order.value?.paymentStatus
  })
  if (error) {
    useToast().error('Произошла ошибка')
    return
  }
  useToast().success('Статус обновлен')
}
</script>

<template>
  <div v-if="loading === 'success' && order">
    <div class="flex gap-4">
      <v-table
        line
        :striped="false"
      >
        <template #header>
          <div> {{ `Номер заказа ${order.id}` }}</div>
          <div class="text-base flex flex-col gap-4">
            <div>
              Дата заказа:
              {{ new Date(order.created_at).toLocaleDateString() }}
            </div>
            <div class="flex items-center">
              <span class="w-[114px]">Статус заказа:</span>
              <v-select
                v-model="order.status"
                :options="statusOptions"
              />
            </div>
            <div class="flex items-center">
              <span class="w-[114px] inline-block">Статус оплаты:</span>
              <v-select
                v-model="order.paymentStatus"
                :options="paymentStatusOptions"
              />
            </div>
          </div>
        </template>
        <thead>
          <tr>
            <th>Продукт </th>
            <th>Количество</th>
            <th>Стоимость</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="product in order.ordered_products"
            :key="product.id"
          >
            <td>
              <div class="flex gap-4 items-center">
                <img
                  :src="product.products.img[0]"
                  class="rounded h-20"
                  alt=""
                />
                <div>{{ product.products.title }} </div>
              </div>
            </td>
            <td>{{ product.count }} </td>
            <td>{{ order.price }} </td>
          </tr>
        </tbody>
      </v-table>
      <div>
        <div class="rounded bg-white min-w-[500px] p-4">
          <div class="mb-2">Итог заказа</div>
          <div class="grid grid-cols-2">
            <div>Общая сумма:</div>
            <div>{{ formatPrice(order.price) }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="flex gap-4 mt-4">
      <v-button @click="updateOrder">сохранить</v-button>
      <app-link :to="{ name: 'AdminOrders' }">
        <v-button>назад</v-button>
      </app-link>
    </div>
  </div>
  <div
    v-else-if="loading === 'loading'"
    class="flex justify-center items-center h-[50vh]"
  >
    <v-loader />
  </div>
</template>
