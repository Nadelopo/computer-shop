<script setup lang="ts">
import Navbar from '@/components/Navbar'
import NavbarMobile from '@/components/Navbar.mobile.vue'
</script>

<template>
  <Navbar />
  <main>
    <router-view />
  </main>
  <navbar-mobile />
</template>
