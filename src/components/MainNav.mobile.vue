<script setup lang="ts">
import HomeSVG from '@/assets/icons/home.svg?component'
import FavouritesSVG from '@/assets/icons/favourites.svg?component'
import CartSVG from '@/assets/icons/cart.svg?component'
import ComparisonSVG from '@/assets/icons/comparison.svg?component'
import AvatarSVG from '@/assets/icons/avatar.svg?component'

const links = [
  {
    name: 'Главная',
    page: 'Home',
    svg: HomeSVG
  },
  {
    name: 'Избранное',
    page: 'Favourites',
    svg: FavouritesSVG
  },
  {
    name: 'Корзина',
    page: 'Cart',
    svg: CartSVG
  },
  {
    name: 'Сравнение',
    page: 'Comparison',
    svg: ComparisonSVG
  },
  {
    name: 'Профиль',
    page: 'Profile',
    svg: AvatarSVG
  }
]
</script>

<template>
  <div class="nav__mobile">
    <router-link
      v-for="link in links"
      :key="link.name"
      :to="{ name: link.page }"
    >
      <Component :is="link.svg" />
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
    @media (width < 700px)
      font-size: 10px
    &.router-link-active
      color: var(--color-text)
      fill: var(--color-text)
    svg
      height: 20px
      width: 20px
      margin: 0 auto
    div
      text-align: center
</style>
