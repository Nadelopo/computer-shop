<script setup lang="ts">
type Props = {
  value?: string | boolean | number
  title: string | number
  units?: string
}

withDefaults(defineProps<Props>(), {
  units: ''
})

const modelValue = defineModel<string | string[] | boolean | number[]>()

const id = crypto.randomUUID()
</script>

<template>
  <div class="flex m-auto main">
    <div>
      <label
        :for="id"
        class="label-cbx"
      >
        <input
          :id="id"
          v-model="modelValue"
          :value="value"
          type="checkbox"
          class="invisible"
        />
        <div class="checkbox">
          <svg
            width="20px"
            height="20px"
            viewBox="0 0 20 20"
          >
            <path
              d="M3,1 L17,1 L17,1 C18.1045695,1 19,1.8954305 19,3 L19,17 L19,17 C19,18.1045695 18.1045695,19 17,19 L3,19 L3,19 C1.8954305,19 1,18.1045695 1,17 L1,3 L1,3 C1,1.8954305 1.8954305,1 3,1 Z"
            />
            <polyline points="4 11 8 15 16 6"></polyline>
          </svg>
        </div>
      </label>
    </div>
    <label
      :for="id"
      class="cursor-pointer"
    >
      {{ title }} {{ units }}
    </label>
  </div>
</template>

<style scoped lang="sass">
.main, .label-cbx
  user-select: none
  cursor: pointer
  margin-bottom: 0
  input
    display: none
  input:checked
    & + .checkbox
      border-color: var(--main)
      svg
        path
          fill: var(--main)
        polyline
          stroke-dashoffset: 0
  &:hover
    .checkbox
      svg
        path
          stroke-dashoffset: 0
  .checkbox
    position: relative
    top: 2px
    float: left
    margin-right: 8px
    width: 20px
    height: 20px
    border: 2px solid #C8CCD4
    border-radius: 3px
    svg
      position: absolute
      top: -2px
      left: -2px
      path
        fill: none
        stroke: var(--main)
        stroke-width: 2
        stroke-linecap: round
        stroke-linejoin: round
        stroke-dasharray: 71px
        stroke-dashoffset: 71px
        transition: all .6s ease
      polyline
        fill: none
        stroke: #FFF
        stroke-width: 2
        stroke-linecap: round
        stroke-linejoin: round
        stroke-dasharray: 18px
        stroke-dashoffset: 18px
        transition: all .3s ease
  > span
    pointer-events: none
    vertical-align: middle
.w
  @media (max-width: 991px) and (min-width: 768px)
    width: 70%
</style>
