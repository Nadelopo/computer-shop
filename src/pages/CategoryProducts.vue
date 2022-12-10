<script setup lang="ts">
import { nextTick, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useProductsStore } from '@/stores/productsStore'
import ProductBlock from '@/components/CategoryProducts/ProductBlock.vue'
import Search from '@/components/CategoryProducts/Search.vue'
import FiltersList from '@/components/CategoryProducts/FiltersList.vue'

const { products, loader } = storeToRefs(useProductsStore())
const { setProducts } = useProductsStore()

const categoryId = Number(useRoute().params.id)

setProducts(categoryId)

onUnmounted(() => {
  products.value = []
})

const styles = ref('card__disable')

watch(
  () => products.value.length,
  async (cur) => {
    await nextTick()
    if (cur) {
      styles.value = 'card__active'
    } else {
      styles.value = 'card__disable'
    }
  }
)
</script>

<template>
  <div class="container">
    <div class="grid">
      <filters-list />
      <div>
        <Search />
        <template v-if="loader === 'success'">
          <div class="product__list">
            <transition-group name="list">
              <ProductBlock
                v-for="product in products"
                :key="product.id"
                :item="product"
                :class="styles"
              />
            </transition-group>
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
  position: relative

.card__active
  transform: scale(1)
  opacity: 1

.card__disable
  transform: scale(0.7)
  opacity: 0
</style>
