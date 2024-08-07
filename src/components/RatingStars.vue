<script setup lang="ts">
import { ref, watch } from 'vue'

type Props = {
  modelValue: number
  static?: boolean
  size?: 'normal' | 'small'
}

const props = withDefaults(defineProps<Props>(), {
  static: true,
  size: 'normal'
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
    class="flex items-center"
  >
    <div>
      <template v-if="modelValue === 0">
        <div class="rating__static" />
      </template>
      <template v-else>
        <div
          v-for="i in arr"
          :key="i"
          :title="`Оценка «${i}»`"
          class="rating__static"
          :class="[{ coloured: Math.round(modelValue) + 1 > i }, size]"
        />
      </template>
    </div>
    <div :class="[size === 'normal' ? 'text-lg' : 'text-base']">
      {{ modelValue ? modelValue.toFixed(2) : 'нет отзывов' }}
    </div>
  </div>
  <div
    v-else
    class="rating"
  >
    <template
      v-for="i in arr"
      :key="i"
    >
      <input
        :id="`star-${i}`"
        v-model="stars"
        type="radio"
        name="rating"
        :value="i"
      />
      <label
        :for="`star-${i}`"
        :title="`Оценка «${i}»`"
        :class="[size]"
      />
    </template>
  </div>
</template>

<style scoped lang="sass">

.rating
  overflow: hidden
  width: max-content
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
        &.small
          font-size: 16px
          width: 16px
        &:before
          content: '★'

    > label:hover
      transition: 0.3s
      transform: scale(1.1)
      color: var(--main)

      ~ label
        transition: 0.3s
        color: var(--main)

  > input:checked ~ label
    color: var(--main)
    transition: 0.3s
    text-shadow: 1px 1px var(--main)

  >
    input:checked
      + label:hover, ~ label:hover
        color: var(--main)
        transition: 0.3s

        ~ label
          color: var(--main)


    label:hover ~ input:checked ~ label
      color: var(--main)


.rating__static
  float: right
  width: 32px
  padding: 0
  font-size: 32px
  line-height: 32px
  text-shadow: 1px 1px #bbb
  transition: transform 0.3s, color 0.3s
  color: lightgrey
  &:before
    content: '★'
  &.coloured
    color: var(--main)
  &.small
    font-size: 16px
    width: 16px
</style>
