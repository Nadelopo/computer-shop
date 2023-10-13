<script setup lang="ts">
import { ref, watch } from 'vue'

type Props = {
  modelValue: number
  static?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  static: true
})

const emit = defineEmits(['update:modelValue'])

const stars = ref(props.modelValue)

watch(stars, () => {
  emit('update:modelValue', Number(stars.value))
})

const arr = [5, 4, 3, 2, 1]
</script>

<template>
  <div
    v-if="static"
    class="flex"
  >
    <div>
      <template v-if="modelValue === 0">
        <label class="rating__static" />
      </template>
      <template v-else>
        <label
          v-for="i in arr"
          :key="i"
          :title="`Оценка «${i}»`"
          class="rating__static"
          :class="{ coloured: Math.round(modelValue) + 1 > i }"
        />
      </template>
    </div>
    <div class="self-center">
      {{ modelValue ? modelValue.toFixed(2) : 'нет отзывов' }}
    </div>
  </div>
  <div
    v-else
    class="rating area"
  >
    <template
      v-for="i in arr"
      :key="i"
    >
      <input
        :id="'star-' + i"
        v-model="stars"
        type="radio"
        name="rating"
        :value="i"
      />
      <label
        :for="'star-' + i"
        :title="`Оценка «${i}»`"
      />
    </template>
  </div>
</template>

<style scoped lang="sass">

.rating
  overflow: hidden
  &.area
    width: 210px
  &:not(:checked)
    >
      input
        display: none
      label
        float: right
        width: 42px
        padding: 0
        cursor: pointer
        font-size: 32px
        line-height: 32px
        color: lightgrey
        text-shadow: 1px 1px #bbb
        transition: 0.3s
        &:before
          content: '★'

    > label:hover
      transition: 0.3s
      transform: scale(1.1)
      color: var(--color-main)

      ~ label
        transition: 0.3s
        color: var(--color-main)

  > input:checked ~ label
    color: var(--color-main)
    transition: 0.3s
    text-shadow: 1px 1px var(--color-main)

  >
    input:checked
      + label:hover, ~ label:hover
        color: var(--color-main)
        transition: 0.3s

        ~ label
          color: var(--color-main)


    label:hover ~ input:checked ~ label
      color: var(--color-main)


.rating__static
  float: right
  width: 32px
  padding: 0
  font-size: 32px
  line-height: 32px
  text-shadow: 1px 1px #bbb
  transition: 0.3s
  color: lightgrey
  &:before
    content: '★'
  &.coloured
    color: var(--color-main)
</style>
