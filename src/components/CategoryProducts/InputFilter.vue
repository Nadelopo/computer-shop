<script setup lang="ts">
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

const onChange = () => {
  const prevMin = minValue.value
  const prevMax = maxValue.value
  if (minValue.value > Number(props.max)) {
    minValue.value = Number(props.max)
  }

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
          :min="props.min"
          :max="props.max"
          class="filter_price"
          placeholder="0"
          type="number"
          @input="onChange"
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
  &:focus
    border-color: var(--color-main)
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
