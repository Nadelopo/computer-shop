<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
import MainNavMobile from '@/components/MainNav.mobile.vue'
</script>

<template>
  <Navbar />
  <main>
    <router-view />
  </main>
  <MainNavMobile />
</template>
