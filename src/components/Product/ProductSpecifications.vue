<script setup lang="ts">
import type { ProductWithSpecifications } from '@/types/tables/products.types'

defineProps<{
  product: ProductWithSpecifications
}>()
</script>

<template>
  <div class="wrapper grid">
    <div>Характеристики</div>
    <div>
      <div
        v-for="specification in product.specifications"
        :key="specification.id"
        class="specification"
      >
        <div class="specification__title">
          {{ specification.categorySpecificationsId.title }}
        </div>
        <div class="flex items-end">
          {{ specification.valueNumber ?? specification.valueString }}
          {{ specification.categorySpecificationsId.units }}
        </div>
      </div>
      <div class="specification">
        <div class="specification__title">Производитель</div>
        <div class="flex items-end">{{ product.manufacturerId.title }}</div>
      </div>
      <div class="specification">
        <div class="specification__title">Гарантия</div>
        <div class="flex items-end">{{ product.warranty }} мес</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="sass">
.specification
  font-size: 18px
  margin-bottom: 14px
  display: grid
  grid-template-columns: 90% auto
  gap: 20px
  .specification__title
    border-bottom: 1px dotted #5e5e5e
</style>
