<script setup lang="ts">
import { computed, onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useUserStore } from './stores/userStore'
import { supabase } from './supabase'
import Navbar from './components/Navbar.vue'

const { userId, user } = storeToRefs(useUserStore())
const { getUserData } = useUserStore()

onBeforeMount(async () => {
  const token = JSON.parse(localStorage.getItem('supabase.auth.token') || '{}')
    ?.currentSession?.access_token
  if (token) {
    const { user: User, error } = await supabase.auth.api.getUser(token)
    if (User) {
      userId.value = User.id
      user.value = await getUserData(User.id)
    }
    if (error) console.log(error)
  }
})

const isNeed = computed((): boolean => {
  const href = useRoute().fullPath
  return !href.includes('admin') && !href.includes('auth')
})
</script>

<template>
  <Navbar v-if="isNeed" />
  <main><router-view /></main>
</template>

<style lang="sass">
@import "tailwindcss/base"
@import "tailwindcss/components"
@import "tailwindcss/utilities"

*
  box-sizing: border-box
  font-family: Roboto

:root
  --shadow: rgba(0, 0, 0, 0.1)
  --color-main: #26a69a
  --color-sec: #2bbbad
  --back-main: #1c1c1c
  --back-sec: #333333
  --color-text: #61BEB5


body
  font-family: 'Roboto Flex'
  margin: 0
  background: #f5f5f5


body::-webkit-scrollbar
  width: 8px

body::-webkit-scrollbar-track
  background-color: #fff
  border-radius: 0 0 8px 0


body::-webkit-scrollbar-thumb
  background: #7b7b7b
  border-radius: 10px
  transform: matrix(1, 0, 0, -1, 0, 0)

.btn
  border: none
  border-radius: 4px
  padding: 0.375rem 0.75rem
  background: var(--color-main)
  color: #fff
  cursor: pointer
  transition: .3s
  display: flex
  align-items: center
  justify-content: center
  &:hover
    background: #2bbbad
    transition: .3s
  &:active
    transform: scale(0.9)
  &:focus-visible
    outline: 1px solid var(--color-text)
  &__noactive
    border-radius: 4px
    padding: 0.375rem 0.75rem
    cursor: pointer
    transition: .3s
    display: flex
    align-items: center
    justify-content: center
    background: #fff
    color: var(--color-main)
    outline: 1px solid var(--color-text)
    &:hover
      background: var(--color-main)
      color: #fff
    &:active
      transform: scale(0.9)
    &:focus-visible
      outline: 2px solid var(--color-text)

.container
  margin: 0 auto
  padding: 6px 12px
  @media (min-width: 1536px)
    padding: 0 50px


progress::-webkit-progress-bar
  border-radius: 20px
  background: #fff
  border: 2px solid var(--color-main)


progress::-webkit-progress-value
  background: var(--color-main)
</style>
