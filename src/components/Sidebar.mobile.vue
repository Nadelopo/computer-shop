<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { supabase } from '@/db/supabase'
import { useUserStore } from '@/stores/userStore'
import AppLink from './AppLink.vue'
import type { RouteName } from '@/router/types'

defineProps<{
  links: {
    text: string
    page: RouteName
  }[]
}>()

const { user } = storeToRefs(useUserStore())

const isOpen = defineModel<boolean>({ required: true })

const sidebarRef = ref()
const closeSidebar = () => {
  isOpen.value = false
}

const logout = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) console.error(error)
}

onMounted(() => {
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.body.style.overflow = 'visible'
})
</script>

<template>
  <!-- eslint-disable-next-line -->
  <div
    class="wrapper"
    @click="closeSidebar"
  >
    <div
      ref="sidebarRef"
      class="sidebar"
      @click.stop
    >
      <div class="grid grid-cols-2 items-center">
        <div>
          <app-link
            :to="{ name: 'Home' }"
            @click="closeSidebar"
          >
            <img
              src="/img/logoChangeWhiteSizeFnew.png"
              width="95"
              alt=""
            />
          </app-link>
        </div>
        <div class="text-end">
          <button
            type="button"
            @click="closeSidebar"
          >
            <div class="dot dot-f"></div>
            <div class="dot dot-l"></div>
          </button>
        </div>
      </div>
      <div class="list">
        <app-link
          :to="{ name: user ? 'Home' : 'Auth' }"
          @click="logout"
        >
          {{ user ? 'Выйти' : 'Войти' }}
        </app-link>
        <app-link
          v-for="link in links"
          :key="link.text"
          :to="{ name: link.page }"
          @click="closeSidebar"
        >
          {{ link.text }}
        </app-link>
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
