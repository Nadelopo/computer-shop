<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { removeFromStorage } from '@/utils/queries/storage'
import { getImgName } from '@/utils/getImgName'
import { deleteOne } from '@/utils/queries/db'
import { loadingKey, productsKey } from '@/pages/Admin/types'
import VButton from '@/components/UI/VButton.vue'
import VConfirm from '../UI/VConfirm.vue'
import type { CategorySpecificationRead } from '@/types/tables/categorySpecifications.types'

type BasicData = {
  [key: string]: {
    title: string
    value: (string | number)[]
    units?: string
  }
}

defineProps<{
  specifications: CategorySpecificationRead[]
}>()

const products = inject(productsKey, ref([]))
const loading = inject(loadingKey)

const showModal = ref(false)

const deleteProduct = async (id: number, img: string) => {
  showModal.value = true
  const data = await deleteOne('products', id)
  if (data) {
    products.value = products.value.filter((e) => e.id !== data.id)
    await removeFromStorage('products', getImgName(img))
  }
}

const titles = computed(() => products.value.map((e) => e.name))

const basicData = computed((): BasicData => {
  return {
    manufacturers: {
      title: 'Производитель',
      value: products.value.map((e) => e.manufacturers.title)
    },
    imgs: {
      title: 'Изображение',
      value: products.value.map((e) => e.img)
    },
    warranties: {
      title: 'Гарантия',
      value: products.value.map((e) => e.warranty),
      units: 'мес'
    },
    discounts: {
      title: 'Скидка',
      value: products.value.map((e) => e.discount),
      units: '%'
    },
    prices: {
      title: 'Цена',
      value: products.value.map((e) => e.price),
      units: '₽'
    }
  }
})
</script>

<template>
  <div class="table">
    <div class="row">
      <div class="title cell">Наименование</div>
      <div class="cells">
        <div v-for="title in titles" :key="title" class="cell">
          {{ title }}
        </div>
      </div>
    </div>
    <div v-for="(_, i) in specifications" :key="i" class="row">
      <div class="title cell">{{ specifications[i].title }}</div>
      <div class="cells">
        <div v-for="(_, j) in products.length" :key="j" class="cell">
          {{
            products[j].specifications[i].valueNumber ??
            products[j].specifications[i].valueString
          }}
          {{ specifications[i].units }}
        </div>
      </div>
    </div>
    <div v-for="data of basicData" :key="data.title" class="row">
      <div class="title cell">{{ data.title }}</div>
      <div class="cells">
        <div v-for="value in data.value" :key="value" class="cell">
          <template v-if="data.title === 'Изображение'">
            <img :src="String(value)" alt="" />
          </template>
          <template v-else> {{ value }} {{ data.units }} </template>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="cell title">Действия</div>
      <div class="cells">
        <div v-for="product in products" :key="product.id" class="cell">
          <div class="flex flex-col justify-center gap-y-2">
            <router-link
              :to="{
                name: 'EditProducts',
                params: {
                  category: $route.params.category,
                  categoryId: product.categoryId,
                  id: product.id
                }
              }"
            >
              <v-button width="100%"> изменить </v-button>
            </router-link>
            <v-confirm
              label="удалить"
              title="Подтвердите действие"
              :message="`Вы хотите удалить товар - ${product.name}?`"
              type="danger"
              width="100%"
              @ok="deleteProduct(product.id, product.img)"
            />
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="loading === 'empty'"
      class="text-2xl text-center font-normal mt-16"
    >
      товары отсутствуют
    </div>
  </div>
</template>

<style scoped lang="sass">
$borderColor: var(--back-main)

table
  width: 100%
  table-layout: fixed

th
  text-align: center
  vertical-align: text-bottom
  font-size: 14px

td
  text-align: center
  vertical-align: middle
  border-top: 2px solid #1c1c1c
  padding: 6px 0
  img
    max-height: 150px
    max-width: 100%

.table
  max-width: fit-content
  > div:first-child
    border-radius: 4px 4px 0 0
    border-top: 1px solid $borderColor
  > div:last-child
    border-radius: 0 0 4px 4px


.row
  display: flex
  border-bottom: 1px solid $borderColor
  border-left: 1px solid $borderColor
  border-right: 1px solid $borderColor

.title
  font-weight: 600

.cells
  display: flex
  > div:last-child
    border-right: none

.cell
  width: 200px
  padding: 10px
  border-right: 1px solid $borderColor
  text-align: center
  img
    max-height: 150px
    margin: auto
</style>
