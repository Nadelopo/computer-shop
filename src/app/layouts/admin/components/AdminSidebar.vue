<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { storeToRefs } from 'pinia'
import { useCategoriesStore } from '@/modules/categories'
import { useLocalStorage } from '@/shared/composables/localStorage'
import { VAccordion } from '@/components/UI'
import AppLink from '@/components/AppLink.vue'
import { ArrowSvg, HomeSvg } from '@/assets/icons'

const isVisible = ref(false)

const { categories } = storeToRefs(useCategoriesStore())

const isCollapsedStorage = useLocalStorage<boolean>('adminSidebar')
const isCollapsed = ref(isCollapsedStorage.get() || false)
watchEffect(() => {
  isCollapsedStorage.set(isCollapsed.value)
})
</script>

<template>
  <div
    class="sidebar"
    :class="{ collapsed: isCollapsed }"
  >
    <div
      class="fixed p-4"
      style="width: inherit"
    >
      <div class="mb-6 flex justify-between items-center h-[56px]">
        <!-- <h1> -->
        <AppLink
          :to="{ name: 'AdminMain' }"
          class="main"
        >
          <HomeSvg
            width="40"
            fill="#fff"
          />
        </AppLink>
        <!-- </h1> -->
        <AppLink :to="{ name: 'Home' }">
          <img
            class="logo"
            src="/img/logoChangeWhiteSizeFnew.png"
            alt=""
          />
        </AppLink>
      </div>
      <div class="list">
        <div
          class="head"
          @click="isVisible = !isVisible"
        >
          <div
            class="icon"
            title="Продукты категорий"
          >
            <img
              src="/icons/list.svg"
              alt=""
              class="invert"
            />
          </div>
          <span> Продукты категорий </span>
        </div>

        <VAccordion
          :visibility="isVisible"
          :transition="0.3"
        >
          <div
            v-for="category in categories"
            :key="category.title"
            ref="listRef"
            class="li"
          >
            <AppLink
              :to="{
                name: 'AdminProducts',
                params: { category: category.enTitle, id: category.id }
              }"
            >
              <div
                class="icon"
                :title="category.title"
              >
                <img
                  :src="`/icons/${category.enTitle}.svg`"
                  alt=""
                />
              </div>
              <span>
                {{ category.title }}
              </span>
            </AppLink>
          </div>
        </VAccordion>
        <div
          class="head"
          title="Категории"
        >
          <AppLink
            :to="{
              name: 'AdminCategories'
            }"
          >
            <div class="icon">
              <img
                src="/icons/category.svg"
                alt=""
                class="invert"
                style="width: 32px"
              />
            </div>
            <span> Категории </span>
          </AppLink>
        </div>
        <div
          class="head"
          title="Характеристики категорий"
        >
          <AppLink
            :to="{
              name: 'AdminSpecifications'
            }"
          >
            <div class="icon">
              <img
                src="/icons/list.svg"
                alt=""
                class="invert"
              />
            </div>
            <span> Характеристики категорий </span>
          </AppLink>
        </div>
        <div
          class="head"
          title="Производители"
        >
          <AppLink
            :to="{
              name: 'AdminManufacturers'
            }"
          >
            <div class="icon">
              <img
                src="/icons/manufacturer.svg"
                alt=""
                class="invert"
                style="width: 32px"
              />
            </div>
            <span> Производители </span>
          </AppLink>
        </div>
        <div
          class="head"
          title="Магазины"
        >
          <AppLink
            :to="{
              name: 'AdminShops'
            }"
          >
            <div class="icon">
              <img
                src="/icons/stores.svg"
                alt=""
                class="invert"
                style="width: 32px"
              />
            </div>
            <span> Магазины </span>
          </AppLink>
        </div>
        <div
          class="head"
          title="Заказы"
        >
          <AppLink
            :to="{
              name: 'AdminOrders'
            }"
          >
            <div class="icon">
              <img
                src="/icons/orders.svg"
                alt=""
                class="invert"
                style="width: 32px"
              />
            </div>
            <span> Заказы </span>
          </AppLink>
        </div>
      </div>
      <button
        class="toggle"
        type="button"
        @click="isCollapsed = !isCollapsed"
      >
        <ArrowSvg fill="#fff" />
      </button>
    </div>
  </div>
</template>

<style scoped lang="sass">
$transition: .3s
.sidebar
  background: var(--back-main)
  color: #fff
  min-height: 100vh
  font-size: 18px
  font-weight: 500
  position: relative
  transition: width $transition
  width: 320px
  &.collapsed
    width: 124px
    .head span, .li span
      opacity: 0
    .main
      width: 0px
      transform: scale(0)
      transition: $transition
    .toggle
      transform: rotate(90deg)
    .icon
      margin-left: 22px
  .toggle
    position: absolute
    top: 240px
    left: Calc(100% - 20px)
    background: var(--back-sec)
    border-radius: 20px
    padding: 6px
    transform: rotate(-90deg)
    transition:$transition
  .main
    width: 50px
    transform: scale(1)
    transition: $transition
  .logo
    width: 100%
    max-height: 56px


.head
  overflow: hidden
  display: flex
  align-items: center
  padding: 6px 0
  cursor: pointer
  user-select: none
  white-space: nowrap
  transition: $transition
  border-radius: 4px
  &:hover, &:has(.router-link-active)
    background: var(--back-sec)
  a
    width: 100%
    display: flex
  span
    align-self: center
    transition: $transition
.icon
  transition: $transition
  min-width: 48px
  display: flex
  justify-content: center
  img
    width: 40px

.li
  overflow: hidden
  white-space: nowrap
  padding: 10px
  user-select: none
  cursor: pointer
  display: flex
  align-items: center
  border-radius: 4px
  transition: $transition
  &:hover, &:has(.router-link-active)
    background: var(--back-sec)
  a
    width: 100%
    display: flex
    align-items: center
    transition: $transition
  .icon img
    width: 30px
    height: 30px
</style>
