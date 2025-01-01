<script setup lang="ts">
import { ref, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { supabase } from '@/db/supabase'
import { useUserStore } from '@/stores/userStore'
import { useOrders } from '@/utils/useOrders'
import { formatPrice } from '@/utils/formatPrice'
import {
  VTable,
  VPagination,
  VLoader,
  VConfirm,
  VInputText
} from '@/components/UI'
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

  const { data, error, count } = await supabase
    .from('orders')
    .select('id, created_at, name, price, status, paymentStatus', {
      count: 'estimated'
    })
    .eq('userId', user.id)
    .range(currentPage.value * limit, currentPage.value * limit + limit - 1)
    .order('created_at', { ascending: false })
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

  const { error } = await supabase.from('orders').delete().eq('id', id)
  if (error) return

  orders.value = orders.value.filter((e) => e.id !== id)
}

const searchOrderId = ref<number | null>(null)

const searchOrder = async () => {
  if (!searchOrderId.value) {
    loadOrders()
    return
  }

  const { data, error } = await supabase
    .from('orders')
    .select('id, created_at, name, price, status, paymentStatus')
    .eq('id', searchOrderId.value)
    .single()
  if (error) {
    useToast().warning('Заказ не найден')
    return
  }

  orders.value = [data]
  totalOrders.value = 0
}

const clear = () => {
  searchOrderId.value = null
  if (orders.value.length <= 1) {
    loadOrders()
  }
}
</script>

<template>
  <div>
    <v-input-text
      v-model="searchOrderId"
      placeholder="номер заказа"
      class="mb-2"
      @keyup.enter="searchOrder"
      @search="searchOrder"
      @clear="clear"
    />
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
              <action-icon
                tag="a"
                :to="{ name: 'AdminOrderDetails', params: { id: order.id } }"
                :svg="EditSvg"
                paint-type="stroke"
                tooltip="Детали заказа"
              />
              <v-confirm
                v-slot="{ openModal }"
                :message="`Вы точно хотите удалить заказ - ${order.id}`"
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
      class="mt-4"
    />
  </div>
</template>
