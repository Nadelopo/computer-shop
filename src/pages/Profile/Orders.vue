<script setup lang="ts">
import { ref, watch } from 'vue'
import { getAll } from '@/db/queries/tables'
import { useUserStore } from '@/stores/userStore'
import { formatPrice } from '@/utils/formatPrice'
import { useOrders } from '@/utils/useOrders'
import { getWordByQuantity } from '@/components/Cart/useChooseWord'
import { VLoader, VAccordion, VPagination } from '@/components/UI'
import AppLink from '@/components/AppLink.vue'
import { ArrowSvg } from '@/assets/icons'
import type { OrderReadWithDetails } from '@/types/tables/orders.types'
import type { Loading } from '@/types'

const { isUserAuthenticated } = useUserStore()

const orders = ref<OrderReadWithDetails[]>([])
const loading = ref<Loading>('loading')
const showProducts = ref<boolean[]>([])
const limit = 6
const currentPage = ref(0)
const totalOrders = ref(0)
const loadingOrders = async () => {
  loading.value = 'loading'
  const user = await isUserAuthenticated()
  if (!user) return
  const { data, error, count } = await getAll('orders', {
    select:
      '*, ordered_products(*, products(id, title, img, categories(id, enTitle)))',
    match: { userId: user.id },
    range: [currentPage.value * limit, currentPage.value * limit + limit - 1],
    order: ['created_at', { ascending: false }]
  })
  if (error) {
    loading.value = 'error'
    return
  }
  if (!data.length) {
    loading.value = 'empty'
    return
  }
  totalOrders.value = count ?? 0
  orders.value = data
  showProducts.value = Array(data.length).fill(false)
  loading.value = 'success'
}
watch(currentPage, loadingOrders, { immediate: true })

const getCountPorductsInOrder = (i: number) => {
  return orders.value[i].ordered_products.reduce((a, b) => a + b.count, 0)
}

const { getStatus } = useOrders()
</script>

<template>
  <div>
    <div
      v-if="loading === 'success'"
      class="bg-white rounded p-3 mb-4"
    >
      <div
        v-for="(order, i) in orders"
        :key="order.id"
        class="order"
      >
        <div>
          <arrow-svg
            :transform="showProducts[i] ? '' : 'rotate(180)'"
            class="duration-200 mt-2 cursor-pointer"
            @click="showProducts[i] = !showProducts[i]"
          />
        </div>
        <div class="w-full">
          <div class="head">
            <div
              class="inline-flex cursor-pointer items-center gap-3"
              @click="showProducts[i] = !showProducts[i]"
            >
              <div class="font-medium text-2xl">Заказ {{ order.id }}</div>
              <div>
                от {{ new Date(order.created_at).toLocaleDateString() }}
              </div>
            </div>
            <div>
              {{ getCountPorductsInOrder(i) }}
              {{ getWordByQuantity(getCountPorductsInOrder(i)) }}
            </div>
            <div class="price">{{ formatPrice(order.price) }}</div>
          </div>
          <div class="flex justify-between">
            <div>
              Заказ получен
              {{ new Date(order.deliveryDate || '').toLocaleDateString() }}
            </div>
            <div
              class="order__status"
              :class="[order.status]"
            >
              {{ getStatus(order.status) }}
            </div>
          </div>

          <v-accordion :visibility="showProducts[i]">
            <div
              v-for="product in order.ordered_products"
              :key="product.id"
              class="product"
            >
              <div class="flex gap-4">
                <app-link
                  :to="{
                    name: 'Product',
                    params: {
                      productId: product.products.id,
                      categoryId: product.products.categories.id,
                      category: product.products.categories.enTitle
                    }
                  }"
                >
                  <img
                    :src="product.products.img[0]"
                    alt=""
                    class="max-w-[80px] max-h-[80px]"
                  />
                </app-link>
                <div>
                  <app-link
                    :to="{
                      name: 'Product',
                      params: {
                        productId: product.products.id,
                        categoryId: product.products.categories.id,
                        category: product.products.categories.enTitle
                      }
                    }"
                    class="hover:text-text duration-150"
                  >
                    {{ product.products.title }}
                  </app-link>
                </div>
              </div>
              <div>{{ product.count }} шт</div>
              <div>{{ formatPrice(product.price) }}</div>
            </div>
          </v-accordion>
        </div>
      </div>
    </div>
    <div v-else-if="loading === 'loading'">
      <v-loader />
    </div>
    <div
      v-else-if="loading === 'empty'"
      class="text-3xl font-bold"
    >
      Заказов пока нет
    </div>
    <v-pagination
      v-model="currentPage"
      :item-count="totalOrders"
      :page-size="limit"
    />
  </div>
</template>

<style scoped lang="sass">
.order
  display: flex
  width: 100%
  gap: 16px
  &:not(:first-child)
    margin-top: 20px
  .head
    display: grid
    gap: 16px
    grid-template-columns: 2fr  1fr 1fr
    & > div:last-child
      justify-self: end
  .product
    display: grid
    grid-template-columns: 2fr 1fr 1fr
    gap: 16px
    margin: 16px 0
    & > div:last-child
      justify-self: end
</style>
