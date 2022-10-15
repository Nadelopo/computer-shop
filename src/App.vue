<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onBeforeMount } from 'vue'
import Navbar from './components/Navbar.vue'
import { useUserStore } from './stores/userStore'
import { supabase } from './supabase'

const { userId, user } = storeToRefs(useUserStore())
const { getUserData } = useUserStore()

onBeforeMount(async () => {
  const token = JSON.parse(localStorage.getItem('supabase.auth.token') || '{}')
    ?.currentSession?.access_token
  if (token) {
    try {
      const { data: resp } = await supabase.auth.getUser()
      if (resp.user) {
        userId.value = resp.user.id
        user.value = await getUserData(resp.user.id)
      }
    } catch (err) {
      console.log(err)
    }
  }
})
</script>

<template>
  <Navbar />
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

.minput
  all: unset
  width: 100%
  height: 30px
  border-bottom: 1px solid #9e9e9e
  transition: 0.3s
  &:focus
    border-bottom:1px solid var(--color-main)
    -webkit-box-shadow:0 1px 0 0 var(--color-main)
    box-shadow:0 1px 0 0 var(--color-main)
    transition: 0.3s

progress::-webkit-progress-bar
  border-radius: 20px
  background: #fff
  border: 2px solid var(--color-main)


progress::-webkit-progress-value
  background: var(--color-main)
</style>
