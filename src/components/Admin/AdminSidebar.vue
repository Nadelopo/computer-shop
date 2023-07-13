<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCategoriesStore } from '@/stores/categoriesStore'
import VAccordion from '@/components/UI/VAccordion.vue'

const isVisible = ref(false)

const { categories } = storeToRefs(useCategoriesStore())
</script>

<template>
  <div class="sidebar">
    <div class="mb-6 flex justify-between items-center">
      <h1><router-link :to="{ name: 'AdminHome' }">Главная</router-link></h1>
      <router-link :to="{ name: 'Home' }">
        <img src="/img/logoChangeWhiteSizeFnew.png" width="95" alt="" />
      </router-link>
    </div>
    <div class="list">
      <div class="head" @click="isVisible = !isVisible">Продукты категорий</div>
      <v-accordion :visible="isVisible">
        <template v-if="categories">
          <div
            v-for="category in categories"
            :key="category.title"
            ref="listRef"
            class="li"
          >
            <router-link
              :to="{
                name: 'AdminProducts',
                params: { category: category.enTitle, id: category.id }
              }"
            >
              {{ category.title }}
            </router-link>
          </div>
        </template>
      </v-accordion>
      <div class="head">
        <router-link
          :to="{
            name: 'AdminCategories'
          }"
        >
          Категории
        </router-link>
      </div>
      <div class="head">
        <router-link
          :to="{
            name: 'AdminSpecifications'
          }"
        >
          Характеристик категорий
        </router-link>
      </div>

      <div class="head">
        <router-link
          :to="{
            name: 'AdminManufacturers'
          }"
        >
          Производители
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped lang="sass">
.sidebar
  padding: 16px
  background: var(--back-main)
  color: #fff
  min-height: 100vh
  font-size: 18px
  font-weight: 500

.head
  padding: 6px 0
  cursor: pointer
  user-select: none
  a
    display: block

.li
  padding: 0 10px
  user-select: none
  cursor: pointer
  a
    display: block
</style>
