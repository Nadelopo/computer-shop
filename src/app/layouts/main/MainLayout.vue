<script setup lang="ts">
import Header from '@/app/layouts/main/components/Header'
import NavbarMobile from '@/app/layouts/main/components/Navbar.mobile.vue'
</script>

<template>
  <Header />
  <main>
    <router-view />
  </main>
  <NavbarMobile />
</template>
