<script setup lang="ts">
import { ref } from 'vue'
import Accordion from '@/components/UI/Accordion.vue'
import { useCategoriesStore } from '@/stores/categoriesStore'
import { storeToRefs } from 'pinia'

const isVisible = ref(false)

const { categories } = storeToRefs(useCategoriesStore())
</script>

<template>
  <div class="sidebar">
    <div class="mb-6">
      <h1><router-link :to="{ name: 'AdminHome' }">Главная</router-link></h1>
    </div>
    <div class="wrapper">
      <div class="head" @click="isVisible = !isVisible">Категории</div>
      <div class="overflow-hidden">
        <div class="list">
          <Accordion :visible="isVisible">
            <template v-if="categories">
              <div
                v-for="category in categories"
                :key="category.title"
                ref="listRef"
                class="li"
              >
                <router-link
                  :to="{
                    name: 'AdminCreateProducts',
                    params: { link: category.enTitle },
                  }"
                >
                  {{ category.title }}
                </router-link>
              </div>
            </template>
          </Accordion>
          <div class="head">
            <router-link
              :to="{
                name: 'Admin',
                params: { link: 'categories' },
              }"
            >
              Создать категорию
            </router-link>
          </div>
          <div class="head">
            <router-link
              :to="{
                name: 'Admin',
                params: { link: 'specifications' },
              }"
            >
              Добавление характеристик категории
            </router-link>
          </div>

          <div class="head">
            <router-link
              :to="{
                name: 'Admin',
                params: { link: 'categories' },
              }"
            >
              Создать фильтр
            </router-link>
          </div>
        </div>
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
