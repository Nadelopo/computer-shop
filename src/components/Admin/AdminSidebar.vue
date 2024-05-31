<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { storeToRefs } from 'pinia'
import { useCategoriesStore } from '@/stores/categoriesStore'
import { useLocalStorage } from '@/utils/localStorage'
import { VAccordion } from '@/components/UI'
import AppLink from '../AppLink.vue'
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
        <h1>
          <app-link :to="{ name: 'AdminMain' }">
            <home-svg
              width="40"
              fill="#fff"
            />
          </app-link>
        </h1>
        <app-link :to="{ name: 'Home' }">
          <img
            class="logo"
            src="/img/logoChangeWhiteSizeFnew.png"
            alt=""
          />
        </app-link>
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

        <v-accordion
          :visibility="isVisible"
          :transition="0.3"
        >
          <div
            v-for="category in categories"
            :key="category.title"
            ref="listRef"
            class="li"
          >
            <app-link
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
                  :src="'/icons/' + category.enTitle + '.svg'"
                  alt=""
                />
              </div>
              <span>
                {{ category.title }}
              </span>
            </app-link>
          </div>
        </v-accordion>
        <div
          class="head"
          title="Категории"
        >
          <app-link
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
          </app-link>
        </div>
        <div
          class="head"
          title="Характеристики категорий"
        >
          <app-link
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
          </app-link>
        </div>
        <div
          class="head"
          title="Производители"
        >
          <app-link
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
          </app-link>
        </div>
        <div
          class="head"
          title="Магазины"
        >
          <app-link
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
          </app-link>
        </div>
      </div>
      <button
        class="toggle"
        @click="isCollapsed = !isCollapsed"
      >
        <arrow-svg fill="#fff" />
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
    h1
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
  h1
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
