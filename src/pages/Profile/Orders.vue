<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { getAll } from '@/db/queries/tables'
import { formatPrice } from '@/utils/formatPrice'
import { getWordByQuantity } from '@/components/Cart/useChooseWord'
import { VLoader, VAccordion } from '@/components/UI'
import AppLink from '@/components/AppLink.vue'
import { ArrowSvg } from '@/assets/icons'
import type { OrderReadWithDetails } from '@/types/tables/orders.types'
import type { Loading } from '@/types'

const { isUserAuthenticated } = useUserStore()

const orders = ref<OrderReadWithDetails[]>([])
const loading = ref<Loading>('loading')
const showProducts = ref<boolean[]>([])
onBeforeMount(async () => {
  const user = await isUserAuthenticated()
  if (!user) return
  const { data, error } = await getAll('orders', {
    select:
      '*, ordered_products(*, products(id, title, img, categories(id, enTitle)))',
    match: { userId: user.id }
  })
  if (error) {
    loading.value = 'error'
    return
  }
  if (!data.length) {
    loading.value = 'empty'
    return
  }
  orders.value = data
  showProducts.value = Array(data.length).fill(false)
  console.log(data)
  loading.value = 'success'
})

const getCountPorductsInOrder = (i: number) => {
  return orders.value[i].ordered_products.reduce((a, b) => a + b.count, 0)
}
</script>

<template>
  <div
    v-if="loading === 'success'"
    class="bg-white rounded p-3"
  >
    <div
      v-for="(order, i) in orders"
      :key="order.id"
      class="order"
    >
      <div class="head">
        <div
          class="inline-flex cursor-pointer items-center gap-3"
          @click="showProducts[i] = !showProducts[i]"
        >
          <div>
            <arrow-svg
              :transform="showProducts[i] ? '' : 'rotate(180)'"
              class="duration-200"
            />
          </div>
          <div class="font-medium text-2xl">Заказ {{ order.id }}</div>
          <div>от {{ new Date(order.created_at).toLocaleDateString() }}</div>
        </div>
        <div>
          {{ getCountPorductsInOrder(i) }}
          {{ getWordByQuantity(getCountPorductsInOrder(i)) }}
        </div>
        <div class="price">{{ formatPrice(order.price) }}</div>
      </div>

      <v-accordion :visibility="showProducts[i]">
        <div
          v-for="product in order.ordered_products"
          :key="product.id"
          class="product"
        >
          <div class="flex gap-4 pl-7">
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
  <div
    v-else-if="loading === 'loading'"
    class="h-[50vh] flex center place-items-center"
  >
    <v-loader />
  </div>
  <div
    v-else-if="loading === 'empty'"
    class="text-3xl font-bold"
  >
    Заказов пока нет
  </div>
</template>

<style scoped lang="sass">
.order
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
