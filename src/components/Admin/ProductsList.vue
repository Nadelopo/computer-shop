<script setup lang="ts">
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useProductsStore } from '@/stores/productsStore'
import VLoader from '@/components/UI/Vloader.vue'
import VButton from '@/components/UI/VButton.vue'
import type { CategorySpecificationRead } from '@/types/tables/categorySpecifications.types'

defineProps<{
  specifications: CategorySpecificationRead[]
}>()

const { products, loader } = storeToRefs(useProductsStore())
const { setProducts } = useProductsStore()

const categoryId = Number(useRoute().params.id)

if (!products.value.length) {
  setProducts(categoryId)
} else if (products.value[0].categoryId.id !== categoryId) {
  setProducts(categoryId)
}
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
          <th>скидка</th>
          <th>цена</th>
          <th width="5%"></th>
        </tr>
      </thead>
      <template v-if="loader === 'success'">
        <tbody v-for="product in products" :key="product.id">
          <tr>
            <td>{{ product.name }}</td>
            <td
              v-for="specification in product.specifications"
              :key="specification.categorySpecificationsId.id"
            >
              {{ specification.valueNumber ?? specification.valueString }}
              {{ specification.categorySpecificationsId.units }}
            </td>
            <td>{{ product.manufacturerId.title }}</td>
            <td>
              <img :src="product.img" alt="" />
            </td>
            <td>{{ product.warranty }} мес</td>
            <td>{{ product.discount }} %</td>
            <td>{{ product.price }} Р</td>
            <td>
              <div class="flex flex-col justify-center gap-y-2">
                <router-link
                  :to="{
                    name: 'EditProducts',
                    params: {
                      category: $route.params.category,
                      categoryId: product.categoryId.id,
                      id: product.id
                    }
                  }"
                >
                  <v-button class="w-full"> изменить </v-button>
                </router-link>
              </div>
            </td>
          </tr>
        </tbody>
      </template>
    </table>
    <v-loader v-if="loader === 'loading'" />
    <div
      v-if="loader === 'empty'"
      class="text-2xl text-center font-normal mt-16"
    >
      товары отсутствуют
    </div>
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
