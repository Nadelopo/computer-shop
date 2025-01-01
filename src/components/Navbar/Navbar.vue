<script setup lang="ts">
import { ref, toRef, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { supabase } from '@/db/supabase'
import { useCustomRouter } from '@/utils/customRouter'
import { debounce } from '@/utils/debounce'
import { onClickOutsideClose } from '@/utils/onClickOutsideClose'
import { getOrFilterForSearch } from '@/utils/getOrFilterForSearch'
import { useCartStore } from '@/stores/cartStore'
import { useUserStore } from '@/stores/userStore'
import AppLink from '../AppLink.vue'
import ActionIcon from '../ActionIcon.vue'
import Suggestions from './Suggestions.vue'
import Search from './Search.vue'
import { VPopup, VModal, VButton } from '@/components/UI'
import {
  AvatarSvg,
  FavouriteSvg,
  CartSvg,
  ComparisonSvg,
  SearchSvg
} from '@/assets/icons'
import { Role } from '@/types/tables/users.types'
import type { CategoryRead } from '@/types/tables/categories.types'

export type Suggestion = {
  id: number
  title: string
  type: 'category' | 'product'
  enTitle?: string
  categories?: Pick<CategoryRead, 'id' | 'enTitle'>
}

const { user, userLists } = storeToRefs(useUserStore())
const { countCartItems } = storeToRefs(useCartStore())

const router = useCustomRouter()

const logout = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) console.error(error)
  router.push({ name: 'Home' })
}

const inputRef = ref<{ ref: { ref: HTMLInputElement } }>()
const isSuggestionsOpen = onClickOutsideClose(
  toRef(() => inputRef.value?.ref.ref)
)

const search = ref('')
const suggestions = ref<Suggestion[]>([])
const debouncedSearch = debounce(async () => {
  const searchValue = search.value
  if (!searchValue || searchValue === '#') return

  const or = getOrFilterForSearch(searchValue, 'title')
  const [{ data: categoriesData }, { data: productsData }] = await Promise.all([
    supabase.from('categories').select('id, title, enTitle').limit(2).or(or),
    supabase
      .from('products')
      .select('id, title, categories(id, enTitle)')
      .limit(6)
      .or(or)
  ])

  if (!categoriesData || !productsData) return
  suggestions.value = [
    ...categoriesData.map((c) => ({ ...c, type: 'category' as const })),
    ...productsData.map((p) => ({ ...p, type: 'product' as const }))
  ]
  isSuggestionsOpen.value = true
})

const stopRequests = ref(false)
watch(search, () => {
  if (stopRequests.value) return
  debouncedSearch()
})

const openModal = ref(false)
const clear = () => {
  search.value = ''
  suggestions.value = []
  if (openModal.value) {
    openModal.value = false
  }
}

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    stopRequests.value = true
  } else stopRequests.value = false
}

const setSearch = (title: string) => {
  search.value = title
  setTimeout(() => {
    if (!inputRef.value) return
    inputRef.value.ref.ref.selectionStart = title.length
  })
}
</script>

<template>
  <header class="mb-10 py-1">
    <div class="container">
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
        <Search
          ref="inputRef"
          v-model="search"
          :suggestions
          class="hidden lg:block"
          @click="isSuggestionsOpen = true"
          @navigate-to-product="
            ;(isSuggestionsOpen = false), (suggestions = [])
          "
          @keydown="onKeyDown"
          @clear="suggestions = []"
        />
        <div class="nav__rigth">
          <v-popup>
            <template #active>
              <action-icon
                :svg="AvatarSvg"
                variant="default"
              />
            </template>
            <template #content>
              <app-link
                v-if="user?.role === Role.ADMIN"
                :to="{ name: 'AdminMain' }"
                class="popup__el"
              >
                admin
              </app-link>
              <button
                v-if="user"
                type="button"
                class="popup__el"
                @click="logout"
              >
                выйти
              </button>
              <app-link
                v-else
                :to="{ name: 'Auth' }"
                class="popup__el"
              >
                войти
              </app-link>
              <app-link
                :to="{ name: 'ProfileMain' }"
                class="popup__el"
              >
                профиль
              </app-link>
            </template>
          </v-popup>
          <action-icon
            :svg="FavouriteSvg"
            variant="default"
            tag="a"
            :to="{ name: 'Favourites' }"
          >
            <span
              v-if="userLists.favourites.length"
              class="count"
            >
              {{ userLists.favourites.length }}
            </span>
          </action-icon>
          <action-icon
            tag="a"
            :to="{ name: 'Comparison' }"
            :svg="ComparisonSvg"
            variant="default"
          >
            <span
              v-if="userLists.comparison.length"
              class="count"
            >
              {{ userLists.comparison.length }}
            </span>
          </action-icon>
          <action-icon
            tag="a"
            :to="{ name: 'Cart' }"
            :svg="CartSvg"
            variant="default"
          >
            <span
              v-if="countCartItems"
              class="count"
            >
              {{ countCartItems }}
            </span>
          </action-icon>
        </div>
        <div class="flex justify-end lg:hidden">
          <action-icon
            :svg="SearchSvg"
            variant="default"
            @click="openModal = true"
          />
        </div>
        <v-modal
          v-model="openModal"
          full-screen
          class="py-2 xs:px-8 px-2"
        >
          <div class="flex gap-2 items-center">
            <Search
              v-model="search"
              :suggestions
              class="w-full"
              @navigate-to-product=";(suggestions = []), (openModal = false)"
              @clear="suggestions = []"
            />
            <v-button @click="openModal = false">отмена</v-button>
          </div>
          <Suggestions
            :is-suggestions-open
            :suggestions
            mobile
            @click-on-suggestion="clear"
          />
        </v-modal>
      </div>
    </div>
    <Suggestions
      v-if="!openModal"
      :is-suggestions-open
      :suggestions
      @click-on-suggestion="clear"
      @set-search="setSearch"
    />
  </header>
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
  // grid-template-columns:  240px 1fr 240px
  grid-template-columns:  240px 1fr auto
  align-items: center
  height: 60px
  // @media (width <= 1023px)
  //   display: none

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

.nav__rigth
  display: grid
  grid-template-columns: repeat(4, 60px)
  align-items: center
  justify-items: end
  gap: 10px
  @media (width < 1024px)
    display: none
  a
    position: relative
    .count
      position: absolute
      top: -2px
      left: 20px
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
