<script setup lang="ts">
import { onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useProductsStore } from '@/stores/productsStore'
import ProductBlock from '@/components/CategoryProducts/ProductBlock.vue'
import Search from '@/components/CategoryProducts/Search.vue'
import VLoader from '@/components/UI/Vloader.vue'

const { products, loader } = storeToRefs(useProductsStore())
const { getProducts } = useProductsStore()

const categoryId = Number(useRoute().params.id)

if (!products.value.length) {
  getProducts(categoryId)
} else if (products.value[0].categoryId !== categoryId) {
  products.value = []
  getProducts(categoryId)
}

onUnmounted(() => {
  getProducts(categoryId)
})
</script>

<template>
  <div class="container">
    <div class="grid">
      <div />
      <div>
        <Search />
        <template v-if="loader === 'success'">
          <div class="product__list">
            <template v-for="product in products" :key="product.id">
              <ProductBlock :item="product" />
            </template>
          </div>
        </template>
        <template v-else-if="loader === 'loading'">
          <v-loader />
        </template>
        <template v-else>
          <div class="font-bold text-center text-2xl mt-8">
            К сожалению, по вашему запросу ничего не найдено. Проверьте
            правильность ввода или попробуйте изменить запрос.
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped lang="sass">
.grid
  display: grid
  grid-template-columns: 20% 1fr
  gap: 20px

.product__list
  margin-top: 20px
  display: flex
  flex-direction: column
  gap: 30px
</style>
