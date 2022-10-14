<script setup lang="ts"></script>

<template>
  <div>
    <div class="mb-4">1</div>
    <main><router-view /></main>
  </div>
</template>

<style lang="sass">
@import "tailwindcss/base"
@import "tailwindcss/components"
@import "tailwindcss/utilities"

*
  box-sizing: border-box
  font-family: Roboto
</style>
