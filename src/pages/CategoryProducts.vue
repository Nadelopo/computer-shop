<script setup lang="ts">
import { nextTick, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFilterStore } from '@/stores/filterStore'
import { storeToRefs } from 'pinia'
import { VPagination } from '@/components/UI'
import ProductBlock from '@/components/CategoryProducts/ProductBlock.vue'
import Search from '@/components/CategoryProducts/Search.vue'
import Sort from '@/components/CategoryProducts/Sort.vue'
import Filters from '@/components/CategoryProducts/Filters.vue'
import ProductBlockSkeleton from '@/components/CategoryProducts/ProductBlockSkeleton.vue'

const {
  products,
  loading,
  productCount,
  currentPage,
  limit,
  productsPrice,
  warranty,
  manufacturer
} = storeToRefs(useFilterStore())

const router = useRouter()
const route = useRoute()
const styles = ref('card__disable')

onUnmounted(() => {
  productCount.value = 0
  productsPrice.value.min = 0
  productsPrice.value.max = 300_000
  warranty.value.min = 0
  warranty.value.max = 72
  loading.value = 'loading'
  manufacturer.value.values = []
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

const clickOnPaginate = () => {
  scrollTo(0, 0)
  router.push({ query: { ...route.query, page: currentPage.value + 1 } })
}
</script>

<template>
  <div class="container">
    <div class="grid">
      <Filters />
      <div>
        <Search />
        <Sort />
        <template v-if="loading === 'success'">
          <div class="product__list">
            <product-block
              v-for="product in products"
              :key="product.id"
              :item="product"
              :class="styles"
            />
          </div>
        </template>
        <div
          v-else-if="loading === 'loading'"
          class="flex flex-col gap-y-[30px] mb-10 mt-5"
        >
          <template
            v-for="_ in limit"
            :key="_"
          >
            <product-block-skeleton />
          </template>
        </div>
        <template v-else>
          <div class="font-bold text-center text-2xl mt-8">
            К сожалению, по вашему запросу ничего не найдено.
          </div>
        </template>
        <v-pagination
          v-model="currentPage"
          :item-count="productCount"
          :page-size="limit"
          class="mb-8"
          @on-click="clickOnPaginate"
        />
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
  margin-bottom: 40px

.card__active
  transform: scale(1)
  opacity: 1
  transition: .3s

.card__disable
  transform: scale(0.6)
  opacity: 0
  transition: .3s
</style>
