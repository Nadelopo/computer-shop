<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
  minValue: {
    type: Number,
    default: 0,
  },
  maxValue: {
    type: Number,
    required: true,
  },
  step: {
    type: Number,
    default: 1,
  },
  title: {
    type: String,
    default: '',
  },
})

const min = String(props.minValue)
const max = String(props.maxValue)

const minValue = ref(props.minValue)
const maxValue = ref(props.maxValue)

const onChange = () => {
  const prevMin = minValue.value
  const prevMax = maxValue.value

  if (minValue.value > maxValue.value) {
    maxValue.value = prevMin
    minValue.value = prevMax
  }
}
</script>

<template>
  <div>
    <div class="title">{{ title }}</div>
    <div class="grid">
      <div>
        <input
          ref="minRef"
          v-model.number="minValue"
          :step="step"
          :min="min"
          :max="max"
          class="filter_price min"
          placeholder="0"
          type="number"
          @input="onChange"
        />
      </div>
      <div>
        <div class="line"></div>
      </div>
      <div class="text-end">
        <input
          ref="maxRef"
          v-model.number="maxValue"
          :step="step"
          :min="min"
          :max="max"
          class="filter_price max"
          :placeholder="max"
          type="number"
          @input="onChange"
        />
      </div>
    </div>
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
.filter_price:focus
  border-color: #26a69a
  transition: 0.3s
.line
  border: 1px solid #000
  height: 0
  width: 12px
  background-color: #000
.title
  text-align: center
  margin-bottom: 8px
</style>
