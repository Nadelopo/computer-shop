<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue'
import { useToast } from 'vue-toastification'
import { supabase } from '@/shared/api'
import { useUserStore } from '@/modules/users'
import { useCustomRoute } from '@/shared/composables/customRouter'
import { useOrders } from '@/shared/utils/useOrders'
import { VSelect, VButton, VTable, VLoader } from '@/shared/components/UI'
import AppLink from '@/shared/components/AppLink.vue'
import { formatPrice } from '@/shared/utils/formatPrice'
import type { Loading } from '@/shared/types'
import type { OrderReadWithDetails } from '@/modules/orders/types/orders.types'

const route = useCustomRoute('AdminOrderDetails')
const orderId = Number(route.params.id)

const { getSessionUser } = useUserStore()
const loading = ref<Loading>('loading')
const order = ref<OrderReadWithDetails>()
onBeforeMount(async () => {
  const user = await getSessionUser()
  if (!user) return

  const { data, error } = await supabase
    .from('orders')
    .select('*, ordered_products(*, products(id, title, img, categories(id, enTitle)))')
    .eq('id', orderId)
    .single()
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
  const { error } = await supabase
    .from('orders')
    .update({
      status: order.value?.status,
      paymentStatus: order.value?.paymentStatus
    })
    .eq('id', orderId)
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
      <VTable
        line
        :striped="false"
      >
        <template #header>
          <div>{{ `Номер заказа ${order.id}` }}</div>
          <div class="text-base flex flex-col gap-4">
            <div>
              Дата заказа:
              {{ new Date(order.created_at).toLocaleDateString() }}
            </div>
            <div class="flex items-center">
              <span class="w-[114px]">Статус заказа:</span>
              <VSelect
                v-model="order.status"
                :options="statusOptions"
              />
            </div>
            <div class="flex items-center">
              <span class="w-[114px] inline-block">Статус оплаты:</span>
              <VSelect
                v-model="order.paymentStatus"
                :options="paymentStatusOptions"
              />
            </div>
          </div>
        </template>
        <thead>
          <tr>
            <th>Продукт</th>
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
                <div>{{ product.products.title }}</div>
              </div>
            </td>
            <td>{{ product.count }}</td>
            <td>{{ order.price }}</td>
          </tr>
        </tbody>
      </VTable>
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
      <VButton @click="updateOrder">сохранить</VButton>
      <AppLink :to="{ name: 'AdminOrders' }">
        <VButton>назад</VButton>
      </AppLink>
    </div>
  </div>
  <div
    v-else-if="loading === 'loading'"
    class="flex justify-center items-center h-[50vh]"
  >
    <VLoader />
  </div>
</template>
