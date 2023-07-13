<script setup lang="ts">
import { nextTick, onUnmounted, ref, watch } from 'vue'
import { useFilterStore } from '@/stores/filterStore'
import { storeToRefs } from 'pinia'
import ProductBlock from '@/components/CategoryProducts/ProductBlock.vue'
import Search from '@/components/CategoryProducts/Search.vue'
import Sort from '@/components/CategoryProducts/Sort.vue'
import FiltersList from '@/components/CategoryProducts/FiltersList.vue'
import Skeleton from '@/components/CategoryProducts/SkeletonProducts.vue'

const { products, loading } = storeToRefs(useFilterStore())

const styles = ref('card__disable')

onUnmounted(() => {
  products.value = []
})

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
        <Sort />
        <template v-if="loading === 'success'">
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
        <div v-else-if="loading === 'loading'">
          <template v-for="_ in 10" :key="_">
            <Skeleton />
          </template>
        </div>
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
  transition: .3s

.card__disable
  transform: scale(0.6)
  opacity: 0
  transition: .3s
</style>
