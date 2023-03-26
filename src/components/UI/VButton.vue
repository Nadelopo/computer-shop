<template>
  <button v-wave class="btn"><slot></slot></button>
</template>

<style scoped lang="sass">
@import '@/styles/buttons'
.btn
  min-width: 100px
</style>
