<script setup lang="ts">
import { watch, type PropType } from 'vue'
import { useProductsStore } from '@/stores/productsStore'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import type { IcategorySpecifications } from '@/stores/categoriesStore/types'
import Loader from '@/components/UI/loader.vue'

defineProps({
  specifications: {
    type: Array as PropType<IcategorySpecifications[]>,
    required: true,
  },
})

const deleteProduct = (id: number, img: string) => [id, img]

const { products, categoryId } = storeToRefs(useProductsStore())
const { getProductsCard } = useProductsStore()

categoryId.value = Number(useRoute().params.id)

const setTable = (id: number) => {
  if (!products.value.length) {
    getProductsCard(id)
  } else if (products.value[0].categoryId !== id) {
    products.value = []
    getProductsCard(id)
  }
}

setTable(categoryId.value)

watch(useRoute(), (cur) => {
  if (cur.params.id) {
    setTable(Number(cur.params.id))
  }
})
</script>

<template>
  <div>
    <table>
      <thead>
        <tr>
          <th>наименование</th>
          <th v-for="field in specifications" :key="field.title">
            {{ field.title }}
          </th>
          <th>производитель</th>
          <th width="140">изображение</th>
          <th>гарантия</th>
          <th>цена</th>
          <th width="5%"></th>
        </tr>
      </thead>
      <template v-if="products.length">
        <tbody v-for="product in products" :key="product.id">
          <tr>
            <td>{{ product.name }}</td>
            <td
              v-for="specification in product.specifications"
              :key="specification.categorySpecificationsId.id"
            >
              {{ specification.value }}
              {{ specification.categorySpecificationsId.units }}
            </td>
            <td>{{ product.manufacturerId.title }}</td>
            <td>
              <img :src="product.img" alt="" />
            </td>
            <td>{{ product.warranty }} мес</td>
            <td>{{ product.price }} Р</td>
            <td>
              <div class="flex flex-col justify-center gap-y-2">
                <router-link
                  :to="{
                    name: 'Edit',
                    params: { categoryId: product.categoryId, id: product.id },
                  }"
                >
                  <button
                    class="btn w-full"
                    @click="deleteProduct(product.id, product.img)"
                  >
                    изменить
                  </button>
                </router-link>
                <button
                  class="btn__dunger"
                  @click="deleteProduct(product.id, product.img)"
                >
                  удалить
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </template>
    </table>
    <Loader v-if="!products.length" />
  </div>
</template>

<style scoped lang="sass">
table
  width: 100%
  table-layout: fixed

th
  text-align: center
  vertical-align: text-bottom
  font-size: 14px

td
  text-align: center
  vertical-align: middle
  border-top: 2px solid #1c1c1c
  padding: 6px 0
  img
    max-height: 150px
    max-width: 100%
</style>
