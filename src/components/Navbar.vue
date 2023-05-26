<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import Swal from 'sweetalert2'
import { useUserStore } from '../stores/userStore'
import { supabase } from '@/supabase'
import VPopup from './UI/VPopup.vue'
import Sidebar from './Sidebar.vue'
import UserSvg from '@/assets/icons/avatar.svg?component'
import FavouritesSVG from '@/assets/icons/favourites.svg?component'
import CartSVG from '@/assets/icons/cart.svg?component'
import ComparisonSVG from '@/assets/icons/comparison.svg?component'

const { user } = storeToRefs(useUserStore())

const logout = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) console.log(error)
}

const checkAuth = () => {
  if (!user.value) {
    Swal.fire({
      icon: 'error',
      title: 'Необходимо авторизироваться!',
      text: '',
      showDenyButton: true,
      confirmButtonText: 'Войти',
      denyButtonText: `Ок`
    }).then((result) => {
      if (result.isConfirmed) {
        useRouter().push({ name: 'Auth' })
      }
    })
  }
}

const open = ref(false)
</script>

<template>
  <header class="mb-10 py-1">
    <div class="container">
      <div class="root__small">
        <div>
          <button class="dots" @click="open = !open">
            <div class="dot" :class="{ 'dot__active-f': open }" />
            <div class="dot" :class="{ dot__middle__active: open }" />
            <div class="dot" :class="{ 'dot__active-l': open }" />
          </button>
        </div>
        <div class="flex justify-end">
          <router-link :to="{ name: 'Home' }">
            <img
              src="@/assets/img/logoChangeWhiteSizeFnew.png"
              width="95"
              alt=""
            />
          </router-link>
        </div>
      </div>
      <div class="root">
        <div class="logo">
          <router-link :to="{ name: 'Home' }">
            <img
              src="@/assets/img/logoChangeWhiteSizeFnew.png"
              width="95"
              alt=""
            />
          </router-link>
        </div>
        <div class="nav">
          <div class="li">
            <router-link :to="{ name: 'Home' }" class="li__line">
              ГЛАВНАЯ
            </router-link>
          </div>
          <div class="li">
            <router-link :to="{ name: 'Home' }" class="li__line">
              ТОВАРЫ
            </router-link>
          </div>
          <div class="li">
            <router-link :to="{ name: 'Home' }" class="li__line">
              О НАС
            </router-link>
          </div>
          <div class="li">
            <router-link :to="{ name: 'Home' }" class="li__line">
              ДОСТАВКА
            </router-link>
          </div>
          <div class="li">
            <router-link :to="{ name: 'Home' }" class="h-full">
              КОНТАКТЫ
            </router-link>
          </div>
        </div>
        <div class="nav__rigth">
          <div>
            <v-popup>
              <template #active>
                <UserSvg width="25" class="user__svg" />
              </template>
              <template #content>
                <router-link v-if="user?.role == 0" :to="{ name: 'AdminHome' }">
                  admin
                </router-link>
                <div v-if="user" @click="logout">выйти</div>
                <router-link v-else :to="{ name: 'Auth' }">войти</router-link>
                <router-link :to="{ name: 'ProfileMain' }" @click="checkAuth">
                  профиль
                </router-link>
              </template>
            </v-popup>
          </div>
          <router-link :to="{ name: 'Favourites' }">
            <FavouritesSVG fill="#fff" width="25" class="cursor-pointer" />
          </router-link>
          <router-link :to="{ name: 'Comparison' }">
            <ComparisonSVG width="25" />
          </router-link>
          <router-link :to="{ name: 'Cart' }">
            <CartSVG height="25" />
          </router-link>
        </div>
      </div>
    </div>
  </header>
  <Transition name="v">
    <Sidebar v-if="open" v-model:is-open="open" />
  </Transition>
</template>

<style scoped lang="sass">
.v-enter-active,
.v-leave-active
  transition: .5s ease
  overflow: hidden
  position: fixed

.v-enter-from,
.v-leave-to
  translate: -320px
  width: 3000px
  transition: .5s ease
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
  @media (max-width: 1023px)
    display: none

.nav
  display: grid
  grid-template-columns: repeat(5, auto)
  margin: 0 auto
  position: relative
  div
    font-size: 14px
    text-align: center
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

.li
  a
    display: flex
    align-items: center
    padding: 8px
    color: rgba(255,255,255, .8)
    transition: .2s
    &:hover
      color: rgba(255,255,255, 1)

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

.cart__icon
  cursor: pointer
  height: 25px

.root__small
  color: #fff
  display: grid
  grid-template-columns: repeat(2, 1fr)
  align-items: center
  height: 58px
  @media (min-width: 1023px)
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
