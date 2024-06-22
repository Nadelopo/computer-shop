<script setup lang="ts">
import { ref, watch } from 'vue'
import { deleteOneById, getAll } from '@/db/queries/tables'
import { useUserStore } from '@/stores/userStore'
import { useOrders } from '@/utils/useOrders'
import { formatPrice } from '@/utils/formatPrice'
import { VTable, VPagination, VLoader, VConfirm } from '@/components/UI'
import AppLink from '@/components/AppLink.vue'
import ActionIcon from '@/components/ActionIcon.vue'
import { EditSvg, TrashSvg } from '@/assets/icons'
import type { OrderRead } from '@/types/tables/orders.types'
import type { Loading } from '@/types'

type Order = Pick<
  OrderRead,
  'id' | 'created_at' | 'name' | 'price' | 'status' | 'paymentStatus'
>

const orders = ref<Order[]>([])

const { getStatus, getPaymentStatus } = useOrders()

const { isUserAuthenticated } = useUserStore()
const limit = 6
const currentPage = ref(0)
const totalOrders = ref(0)
const loading = ref<Loading>('loading')
const loadOrders = async () => {
  loading.value = 'loading'
  const user = await isUserAuthenticated()
  if (!user) return
  const { data, error, count } = await getAll('orders', {
    select: 'id, created_at, name, price, status, paymentStatus',
    match: { userId: user.id },
    range: [currentPage.value * limit, currentPage.value * limit + limit - 1],
    order: ['created_at', { ascending: false }]
  })
  if (error) {
    loading.value = 'error'
    return
  }
  totalOrders.value = count ?? 0
  orders.value = data
  loading.value = 'success'
}

watch(currentPage, loadOrders, { immediate: true })

const currentRemoveOrderId = ref(0)
const loadingRemove = ref<Loading>('success')
const removeOrder = async (id: number) => {
  loadingRemove.value = 'loading'
  currentRemoveOrderId.value = id
  const { data, error } = await deleteOneById('orders', id)
  if (error) return
  orders.value = orders.value.filter((e) => e.id !== data.id)
}
</script>

<template>
  <div>
    <v-table v-if="loading === 'success'">
      <template #header> Заказы</template>
      <thead>
        <tr>
          <th>Номер заказа</th>
          <th>Имя</th>
          <th>Дата</th>
          <th>Статус оплаты</th>
          <th>Общая цена</th>
          <th>Статус заказа</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="order in orders"
          :key="order.id"
        >
          <td>{{ order.id }}</td>
          <td>{{ order.name }}</td>
          {{ new Date(order.created_at || '').toLocaleDateString() }}
          <td>
            <span
              class="order__payment-status"
              :class="[order.paymentStatus]"
            >
              {{ getPaymentStatus(order.paymentStatus) }}
            </span>
          </td>
          <td>{{ formatPrice(order.price) }}</td>
          <td>
            <span
              class="order__status"
              :class="[order.status]"
            >
              {{ getStatus(order.status) }}
            </span>
          </td>
          <td>
            <div class="flex">
              <app-link
                :to="{ name: 'AdminOrderDetails', params: { id: order.id } }"
              >
                <action-icon
                  :svg="EditSvg"
                  paint-type="stroke"
                  tooltip="Детали заказа"
                />
              </app-link>

              <v-confirm
                v-slot="{ openModal }"
                :message="'Вы точно хотите удалить заказ - ' + order.id"
                @ok="removeOrder(order.id)"
              >
                <action-icon
                  :svg="TrashSvg"
                  variant="danger"
                  :loading="
                    loadingRemove === 'loading' &&
                    currentRemoveOrderId === order.id
                  "
                  @click="openModal"
                />
              </v-confirm>
            </div>
          </td>
        </tr>
      </tbody>
    </v-table>
    <div v-else-if="loading === 'loading'">
      <v-loader />
    </div>
    <v-pagination
      v-model="currentPage"
      :item-count="totalOrders"
      :page-size="limit"
    />
  </div>
</template>
