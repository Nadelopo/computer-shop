<script setup lang="ts">
import type { ProductWithSpecifications } from '@/types/tables/products.types'

const props = defineProps<{
  product: ProductWithSpecifications
}>()

const defaultSpecifications = [
  {
    title: 'Производитель',
    value: props.product.manufacturers.title,
    units: ''
  },
  {
    title: 'Гарантия',
    value: props.product.warranty,
    units: 'мес'
  }
]
</script>

<template>
  <div class="wrapper grid">
    <div class="ml-1">Характеристики</div>
    <div>
      <div
        v-for="(specification, i) in product.specifications"
        :key="specification.id"
        class="specification"
        :class="{ colored: i % 2 == 0 }"
      >
        <div class="specification__title">
          {{ specification.category_specifications.title }}
        </div>
        <div class="flex items-end">
          {{ specification.valueNumber ?? specification.valueString }}
          {{ specification.category_specifications.units }}
        </div>
      </div>
      <div
        v-for="(specification, i) in defaultSpecifications"
        :key="specification.title"
        class="specification"
        :class="{
          colored: i % 2 === product.specifications.length % 2
        }"
      >
        <div class="specification__title">{{ specification.title }} </div>
        <div class="flex items-end">
          {{ specification.value }} {{ specification.units }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="sass">
.specification
  font-size: 18px
  padding: 7px 4px
  display: grid
  grid-template-columns: 1fr minmax(140px, auto)
  gap: 20px
  border-radius: 6px
  @media (width < 640px)
    grid-template-columns: 1fr 1fr
  .specification__title
    border-bottom: 1px dotted #5e5e5e
    @media (width < 640px)
      border-bottom: unset
.colored
  @media (width < 640px)
    background: var(--body-back)
</style>
