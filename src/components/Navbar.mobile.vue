<script setup lang="ts">
import { useCartStore } from '@/stores/cartStore'
import { useUserStore } from '@/stores/userStore'
import { storeToRefs } from 'pinia'
import {
  HomeSvg,
  FavouriteSvg,
  CartSvg,
  ComparisonSvg,
  AvatarSvg
} from '@/assets/icons'
import { computed } from 'vue'

const { countCartItems } = storeToRefs(useCartStore())
const { userLists } = useUserStore()

const links = computed(() => [
  {
    name: 'Главная',
    page: 'Home',
    svg: HomeSvg
  },
  {
    name: 'Избранное',
    page: 'Favourites',
    svg: FavouriteSvg,
    count: userLists.favourites.length
  },
  {
    name: 'Корзина',
    page: 'Cart',
    svg: CartSvg,
    count: countCartItems.value
  },
  {
    name: 'Сравнение',
    page: 'Comparison',
    svg: ComparisonSvg,
    count: userLists.comparison.length
  },
  {
    name: 'Профиль',
    page: 'ProfileMain',
    svg: AvatarSvg
  }
])
</script>

<template>
  <div class="nav__mobile">
    <router-link
      v-for="link in links"
      :key="link.name"
      :to="{ name: link.page }"
    >
      <Component :is="link.svg" />
      <span
        v-if="link.count"
        class="count"
      >
        {{ link.count }}
      </span>
      <div>
        {{ link.name }}
      </div>
    </router-link>
  </div>
</template>

<style scoped lang="sass">
.nav__mobile
  margin-top: auto
  position: sticky
  bottom: 0px
  z-index: 20
  box-sizing: border-box
  display: flex
  justify-content: space-around
  background: #fff
  box-shadow: 0px -2px 2px rgba(0, 0, 0 , 0.12)
  padding: 10px
  width: 100%
  @media (width >= 1024px)
    display: none
  a
    width: 60px
    font-size: 14px
    position: relative
    @media (width < 700px)
      font-size: 10px
    .count
      position: absolute
      top: -10px
      right: 10px
      background: #26a69a
      align-items: center
      justify-content: center
      width: 20px
      display: flex
      height: 20px
      color: #fff
      border-radius: 50px
      font-size: 12px
    &.router-link-exact-active
      color: var(--color-text)
      fill: var(--color-text)
    svg
      height: 20px
      width: 20px
      margin: 0 auto
    div
      text-align: center
</style>
