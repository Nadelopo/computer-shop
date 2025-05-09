<script setup lang="ts">
import Header from '@/app/layouts/main/Header'
import NavbarMobile from '@/app/layouts/main/Navbar.mobile.vue'
</script>

<template>
  <Header />
  <main>
    <router-view />
  </main>
  <NavbarMobile />
</template>
