<script setup lang="ts">
import { computed } from 'vue'
import { VAccordion } from '../UI'
import { ArrowSvg } from '@/assets/icons'

type Props = {
  min?: number
  max: number
  step?: number
  title?: string
}

const minValue = defineModel<number>('minValue', { required: true })
const maxValue = defineModel<number>('maxValue', { required: true })

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  step: 1,
  title: ''
})

const onChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const inputValue = target?.value
  if (inputValue[0] === '0') {
    target.value = String(minValue.value)
  }

  const prevMin = minValue.value > props.max ? props.max : minValue.value
  const prevMax = maxValue.value

  if (minValue.value > Number(props.max)) {
    minValue.value = Number(props.max)
  }

  if (minValue.value > maxValue.value) {
    maxValue.value = prevMin
    minValue.value = prevMax
  }

  if (maxValue.value > props.max) {
    maxValue.value = props.max
  }
}

const visibility = defineModel<boolean>('visibility', { required: true })

const isActive = computed(
  () => maxValue.value < props.max || minValue.value > props.min
)
</script>

<template>
  <div>
    <div
      class="filter__head"
      :class="{ active: isActive }"
      @click="visibility = !visibility"
    >
      <div class="title">
        {{ title }}
      </div>
      <arrow-svg
        :transform="visibility ? '' : 'rotate(180)'"
        class="duration-200"
      />
    </div>
    <v-accordion
      :visibility="visibility"
      class="filter__content"
    >
      <div class="grid">
        <div>
          <input
            ref="minRef"
            v-model.number="minValue"
            :step="step"
            :min="props.min"
            :max="props.max"
            class="filter_price"
            placeholder="0"
            type="number"
            @change="onChange"
          />
        </div>
        <div class="line"></div>
        <div class="text-end">
          <input
            ref="maxRef"
            v-model.number="maxValue"
            :step="step"
            :min="props.min"
            :max="props.max"
            class="filter_price"
            :placeholder="String(props.max)"
            type="number"
            @change="onChange"
          />
        </div>
      </div>
    </v-accordion>
  </div>
</template>

<style scoped lang="sass">
.grid
  display: grid
  grid-template-columns: 1fr auto 1fr
  align-items: center
  grid-gap: 30px
.filter_price
  border: 2px solid #454545
  padding: 4px
  border-radius: 6px
  max-width: 90px
  width: 100%
  outline: none
  transition: 0.3s
  &:focus
    border-color: var(--main)
    transition: 0.3s
.line
  border: 1px solid #000
  height: 0
  width: 12px
  background-color: #000
.title
  user-select: none
  font-weight: 500
</style>
