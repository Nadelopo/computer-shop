<script setup lang="ts">
import { storeToRefs } from 'pinia'
import Swal from 'sweetalert2'
import { useProductsStore } from '@/stores/productsStore'
import { removeFromStorage } from '@/utils/queries/storage'
import { getImgName } from '@/utils/getImgName'
import VButton from '@/components/UI/VButton.vue'
import type { CategorySpecificationRead } from '@/types/tables/categorySpecifications.types'
import { deleteOne } from '@/utils/queries/db'

defineProps<{
  specifications: CategorySpecificationRead[]
}>()

const { products, loader } = storeToRefs(useProductsStore())

const delteProduct = (id: number, img: string) => {
  Swal.fire({
    icon: 'question',
    title: 'Вы хотите удалить товар?',
    text: '',
    showDenyButton: true,
    confirmButtonText: 'Да',
    denyButtonText: `Оставить`
  }).then(async (result) => {
    if (result.isConfirmed) {
      const data = await deleteOne('products', id)
      if (data) {
        products.value = products.value.filter((e) => e.id !== data.id)
        await removeFromStorage('products', getImgName(img))
      }
    }
  })
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
              <v-button
                class="btn__dunger"
                @click="delteProduct(product.id, product.img)"
              >
                удалить
              </v-button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
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
