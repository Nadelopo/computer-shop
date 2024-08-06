<script setup lang="ts">
import { VAccordion, VCheckbox } from '../UI'
import { ArrowSvg } from '@/assets/icons'

defineProps<{
  variantsValues: string[] | { id: number; title: string }[]
  title: string
}>()

const visibility = defineModel<boolean>({ required: true })
const values = defineModel<number[] | string[]>('values', { required: true })

const getProps = (
  value: string | { id: number; title: string }
): { value: string | number; title: string } => {
  if (typeof value === 'string') {
    return { value, title: value }
  }
  return { value: value.id, title: value.title }
}
</script>

<template>
  <div>
    <div
      class="filter__head"
      :class="{ active: values.length }"
      @click="visibility = !visibility"
    >
      <div> {{ title }} </div>
      <arrow-svg
        :transform="visibility ? '' : 'rotate(180)'"
        class="duration-200"
      />
    </div>
    <v-accordion
      :visibility="visibility"
      class="filter__content"
    >
      <div>
        <v-checkbox
          v-for="(value, i) in variantsValues"
          :key="i"
          v-model="values"
          v-bind="getProps(value)"
        />
      </div>
    </v-accordion>
  </div>
</template>
