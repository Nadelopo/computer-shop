<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { supabase } from '@/db/supabase'
import { useCustomRouter } from '@/utils/useCustomRouter'
import { useUserStore } from '../stores/userStore'
import { VPopup } from '@/components/UI'
import SidebarMobile from './Sidebar.mobile.vue'
import { AvatarSvg, FavouriteSvg, CartSvg, ComparisonSvg } from '@/assets/icons'
import { Role } from '@/types/tables/users.types'
import { useCartStore } from '@/stores/cartStore'
import AppLink from './AppLink.vue'
import type { RouteName } from '@/router/types'

const { user, userLists } = storeToRefs(useUserStore())
const { countCartItems } = storeToRefs(useCartStore())

const router = useCustomRouter()

const logout = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) console.error(error)
  router.push({ name: 'Home' })
}

const open = ref(false)

const links: { text: string; page: RouteName }[] = [
  {
    text: 'Главная',
    page: 'Home'
  },
  {
    text: 'Товары',
    page: 'Home'
  },
  {
    text: 'О нас',
    page: 'Home'
  },
  {
    text: 'Доставка',
    page: 'Home'
  },
  {
    text: 'Контакты',
    page: 'Home'
  }
]
</script>

<template>
  <header class="mb-10 py-1">
    <div class="container">
      <div class="root__small">
        <div>
          <button
            class="dots"
            @click="open = !open"
          >
            <div
              class="dot"
              :class="{ 'dot__active-f': open }"
            />
            <div
              class="dot"
              :class="{ dot__middle__active: open }"
            />
            <div
              class="dot"
              :class="{ 'dot__active-l': open }"
            />
          </button>
        </div>
        <div class="flex justify-end">
          <app-link :to="{ name: 'Home' }">
            <img
              src="/img/logoChangeWhiteSizeFnew.png"
              width="95"
              alt=""
            />
          </app-link>
        </div>
      </div>
      <div class="root">
        <div class="logo">
          <app-link :to="{ name: 'Home' }">
            <img
              src="/img/logoChangeWhiteSizeFnew.png"
              width="95"
              alt=""
            />
          </app-link>
        </div>
        <ul class="nav">
          <li
            v-for="(link, i) in links"
            :key="link.text"
            class="li"
          >
            <app-link
              :to="{ name: link.page }"
              :class="{ li__line: i !== links.length - 1 }"
            >
              {{ link.text }}
            </app-link>
          </li>
        </ul>
        <div class="nav__rigth">
          <div>
            <v-popup>
              <template #active>
                <avatar-svg
                  width="25"
                  class="user__svg"
                />
              </template>
              <template #content>
                <app-link
                  v-if="user?.role == Role.ADMIN"
                  :to="{ name: 'AdminMain' }"
                >
                  admin
                </app-link>
                <div
                  v-if="user"
                  @click="logout"
                >
                  выйти
                </div>
                <app-link
                  v-else
                  :to="{ name: 'Auth' }"
                >
                  войти
                </app-link>
                <app-link :to="{ name: 'ProfileMain' }"> профиль </app-link>
              </template>
            </v-popup>
          </div>
          <app-link :to="{ name: 'Favourites' }">
            <favourite-svg
              fill="#fff"
              width="25"
              class="cursor-pointer"
            />
            <span
              v-if="userLists.favourites.length"
              class="count"
            >
              {{ userLists.favourites.length }}
            </span>
          </app-link>
          <app-link :to="{ name: 'Comparison' }">
            <comparison-svg width="25" />
            <span
              v-if="userLists.comparison.length"
              class="count"
            >
              {{ userLists.comparison.length }}
            </span>
          </app-link>
          <app-link :to="{ name: 'Cart' }">
            <cart-svg height="25" />
            <span
              v-if="countCartItems"
              class="count"
            >
              {{ countCartItems }}
            </span>
          </app-link>
        </div>
      </div>
    </div>
  </header>
  <Transition name="sidebar">
    <sidebar-mobile
      v-if="open"
      v-model:is-open="open"
      :links="links"
    />
  </Transition>
</template>

<style scoped lang="sass">
.sidebar-enter-active,
.sidebar-leave-active
  transition: .4s ease
  overflow: hidden
  position: fixed

.sidebar-enter-from,
.sidebar-leave-to
  translate: -320px
  width: 3000px
  transition: .4s ease
  opacity: 0

header
  background: var(--back-main)
  user-select: none

.root
  color: #fff
  display: grid
  grid-template-columns:  240px 1fr 240px
  align-items: center
  height: 60px
  @media (width <= 1023px)
    display: none

.nav
  display: grid
  grid-template-columns: repeat(5, auto)
  margin: 0 auto
  position: relative
  li
    font-size: 14px
    text-align: center
    a
      display: flex
      align-items: center
      padding: 8px
      color: rgba(255,255,255, .8)
      transition: .2s
      text-transform: uppercase
      height: 100%
      &:hover
        color: rgba(255,255,255, 1)

  &::after
    top: 0
    content: ""
    width: 100%
    background-color: rgba(255,255,255, .8)
    position: absolute
    height: 1px
  &::before
    content: ""
    bottom: 0
    width: 100%
    background-color: rgba(255,255,255, .8)
    position: absolute
    height: 1px


.li__line
  &::after
    content: ""
    width: 1px
    height: 32px
    background-color: #d7d7d7
    display: inline-block
    transform: rotate(25deg) translateY(13px)
    margin: -10px 0 10px 30px

.user__svg
  fill: rgba(255,255,255, .8)
  transition: .2s
  cursor: pointer
  &:hover
    fill: rgba(255,255,255, 1)

.nav__rigth
  display: grid
  grid-template-columns: repeat(4, 60px)
  align-items: center
  justify-items: end
  a
    position: relative
    .count
      position: absolute
      top: -10px
      left: 14px
      background: #26a69a
      align-items: center
      justify-content: center
      width: 20px
      display: flex
      height: 20px
      border-radius: 50px
      font-size: 12px

.cart__icon
  cursor: pointer
  height: 25px

.root__small
  color: #fff
  display: grid
  grid-template-columns: repeat(2, 1fr)
  align-items: center
  height: 58px
  @media (width >= 1024px)
    display: none
  .dots
    width: 40px
    display: flex
    flex-direction: column
    gap: 6px
    .dot
      transition: .25s
      width: 100%
      background: #fff
      height: 3px
      border-radius: 4px
      &__active
        &-f
          transform-origin: 18%
          transform: rotate(45deg)
        &-l
          transform-origin: 18%
          transform: rotate(-45deg)
    .dot__middle
      opacity: 1
      &__active
        opacity: 0
</style>
