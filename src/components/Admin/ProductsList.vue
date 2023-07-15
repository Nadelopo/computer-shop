<script setup lang="ts">
import { inject, ref } from 'vue'
import { removeFromStorage } from '@/utils/queries/storage'
import { getImgName } from '@/utils/getImgName'
import { deleteOne } from '@/utils/queries/db'
import { loadingKey, productsKey } from '@/pages/Admin/types'
import VButton from '@/components/UI/VButton.vue'
import VConfirm from '../UI/VConfirm.vue'
import type { CategorySpecificationRead } from '@/types/tables/categorySpecifications.types'

defineProps<{
  specifications: CategorySpecificationRead[]
}>()

const products = inject(productsKey, ref([]))
const loading = inject(loadingKey)

const showModal = ref(false)

const deleteProduct = async (id: number, img: string) => {
  showModal.value = true
  const data = await deleteOne('products', id)
  if (data) {
    products.value = products.value.filter((e) => e.id !== data.id)
    await removeFromStorage('products', getImgName(img))
  }
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
            :key="specification.category_specifications.id"
          >
            {{ specification.valueNumber ?? specification.valueString }}
            {{ specification.category_specifications.units }}
          </td>
          <td>{{ product.manufacturers.title }}</td>
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
                    categoryId: product.categoryId,
                    id: product.id
                  }
                }"
              >
                <v-button class="w-full"> изменить </v-button>
              </router-link>
              <v-confirm
                label="удалить"
                title="Подтвердите действие"
                :message="`Вы хотите удалить товар - ${product.name}?`"
                class="w-full"
                type="danger"
                @ok="deleteProduct(product.id, product.img)"
              />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div
      v-if="loading === 'empty'"
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
