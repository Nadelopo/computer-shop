<script setup lang="ts">
defineProps<{ rating: number }>()
</script>

<template>
  <div class="flex gap-y-2 items-center">
    <div class="rating">
      <label />
    </div>
    <div>
      {{ Number(rating.toFixed(2)) || 'нет отзывов' }}
    </div>
  </div>
</template>

<style scoped lang="sass">
.rating
  overflow: hidden
  label
    float: right
    width: 32px
    padding: 0
    cursor: pointer
    font-size: 32px
    line-height: 32px
    color: var(--color-main)
    text-shadow: 1px 1px #bbb
    transition: 0.3s
    &:before
      content: '★'
</style>
