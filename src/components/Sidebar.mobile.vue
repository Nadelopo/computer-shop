<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { supabase } from '@/supabase'
import { onClickOutside } from '@/utils/onClickOutside'
import { useUserStore } from '@/stores/userStore'

defineProps<{
  isOpen: boolean
  links: {
    text: string
    page: string
  }[]
}>()

const { user } = storeToRefs(useUserStore())

const emit = defineEmits<{
  'update:isOpen': [boolean]
}>()

const sidebarRef = ref()
const closeSidebar = () => {
  emit('update:isOpen', false)
}

const logout = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) console.log(error)
}

onClickOutside(sidebarRef, closeSidebar)

onMounted(() => {
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.body.style.overflow = 'visible'
})
</script>

<template>
  <div class="wrapper">
    <div ref="sidebarRef" class="sidebar">
      <div class="grid grid-cols-2 items-center">
        <div>
          <router-link :to="{ name: 'Home' }" @click="closeSidebar">
            <img src="/img/logoChangeWhiteSizeFnew.png" width="95" alt="" />
          </router-link>
        </div>
        <div class="text-end">
          <button @click="closeSidebar">
            <div class="dot dot-f"></div>
            <div class="dot dot-l"></div>
          </button>
        </div>
      </div>
      <div class="list">
        <router-link :to="{ name: user ? 'Home' : 'Auth' }" @click="logout">
          {{ user ? 'Выйти' : 'Войти' }}
        </router-link>
        <router-link
          v-for="link in links"
          :key="link.text"
          :to="{ name: link.page }"
          @click="closeSidebar"
        >
          {{ link.text }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped lang="sass">
.wrapper
  z-index: 101
  width: 100%
  position: absolute
  height: 100%
  top: 0
  bottom: 0
  left: 0
  right: 0
  transition: .2s
  backdrop-filter: brightness(0.4)
  .sidebar
    position: absolute
    background: var(--back-main)
    min-width: 320px
    top: 0
    height: 100%
    color: #fff
    padding: 20px
    transition: .2s
    .list
      margin-top: 20px
      font-size: 20px
      display: flex
      flex-direction: column
      gap: 10px
      a
        padding-left: 20px

.dot
  transition: .2s
  width: 40px
  margin: 10px 0
  background: #fff
  height: 3px
  transform-origin: 27%
  border-radius: 4px
  &-f
    transform: rotate(45deg)
  &-l
    transform: rotate(-45deg)
</style>
