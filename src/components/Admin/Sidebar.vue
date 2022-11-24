<script setup lang="ts">
import { ref } from 'vue'
import Accordion from '@/components/UI/Accordion.vue'

// import { categoriesStore } from '@/stores/categoriesStore'
// import { storeToRefs } from 'pinia'

const isVisible = ref(false)

// const { categories } = storeToRefs(categoriesStore())
const categories = ref([
  {
    id: 0,
    title: 'Видеокарты',
    enTitle: '',
    src: '',
  },
  {
    id: 1,
    title: 'Процессоры',
    enTitle: '',
    src: '',
  },
])
</script>

<template>
  <div class="sidebar">
    <div class="mb-6">
      <h1><router-link :to="{ name: 'Home' }">Главная</router-link></h1>
    </div>
    <div class="wrapper">
      <div class="head" @click="isVisible = !isVisible">Категории</div>
      <div class="overflow-hidden">
        <div class="list">
          <Accordion :visible="isVisible">
            <template v-if="categories">
              <div
                v-for="categoryq in categories"
                :key="categoryq.title"
                ref="listRef"
                class="li"
              >
                <router-link
                  :to="{
                    name: 'AdminHome',
                    params: { category: categoryq.enTitle },
                  }"
                >
                  {{ categoryq.title }}
                </router-link>
              </div>
            </template>
            <div class="li">
              <router-link
                :to="{
                  name: 'AdminHome',
                }"
              >
                создать категорию
              </router-link>
            </div>
            <div class="li">
              <router-link
                :to="{
                  name: 'AdminHome',
                }"
              >
                создать фильтр
              </router-link>
            </div>
          </Accordion>
        </div>
      </div>
      <div></div>
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



.li
  padding: 0 10px
  user-select: none
  cursor: pointer
</style>
