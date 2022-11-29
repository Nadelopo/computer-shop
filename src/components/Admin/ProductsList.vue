<script setup lang="ts">
import { watch } from 'vue'
import { useProductsStore } from '@/stores/productsStore'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'

defineProps({
  form: {
    type: Object,
    default: () => ({}),
  },
})

const deleteProduct = (id: number, img: string) => null

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
    <table v-if="products[0]?.specifications">
      <thead>
        <tr>
          <th>наименование</th>
          <th
            v-for="field in products[0].specifications"
            :key="field.categorySpecificationsId.title"
          >
            {{ field.categorySpecificationsId.title }}
          </th>
          <th>производитель</th>
          <th>изображение</th>
          <th>гарантия</th>
          <th>цена</th>
          <th width="5%"></th>
        </tr>
      </thead>
      <tbody v-for="product in products" :key="product.id">
        <tr>
          <td>{{ product.name }}</td>
          <td
            v-for="specification in product.specifications"
            :key="specification.categorySpecificationsId.title"
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
            <button class="btn" @click="deleteProduct(product.id, product.img)">
              удалить
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
table {
  width: 100%;
  table-layout: fixed;
}
th {
  text-align: center;
  vertical-align: text-bottom;
  font-size: 14px;
}
td {
  text-align: center;
  vertical-align: middle;
  border-top: 2px solid #1c1c1c;
}
</style>
