<script setup lang="ts">
import { computed, ref } from 'vue'
import { StorageError, removeFromStorage } from '@/db/queries/storage'
import { deleteOneById } from '@/db/queries/tables'
import { VButton, VLoader, VConfirm } from '@/components/UI'
import type { CategorySpecificationRead } from '@/types/tables/categorySpecifications.types'
import type { ProductWithSpecifications } from '@/types/tables/products.types'
import type { Loading } from '@/types'

type BasicData = {
  [key: string]: {
    title: string
    value: (string | number)[]
    units?: string
  }
}

const props = defineProps<{
  specifications: CategorySpecificationRead[]
  loading: Loading
  products: ProductWithSpecifications[]
}>()

const emit = defineEmits<{
  'update:products': [ProductWithSpecifications[]]
}>()

const loadingDeletion = ref<Loading>('loading')
const deleteProduct = async (id: number, img: string[]) => {
  loadingDeletion.value = 'loading'
  const { data, error } = await deleteOneById('products', id)
  if (error) return

  emit(
    'update:products',
    props.products.filter((e) => e.id !== data.id)
  )
  const deleteImages: Promise<{ error: null | StorageError }>[] = []
  img.forEach((url) => {
    deleteImages.push(removeFromStorage('products', url))
  })
  const errorDelete = (await Promise.all(deleteImages)).some((e) => e === null)

  if (errorDelete) {
    loadingDeletion.value = 'error'
  }
  loadingDeletion.value = 'success'
}

const titles = computed(() => props.products.map((e) => e.name))

const basicData = computed((): BasicData => {
  return {
    manufacturers: {
      title: 'Производитель',
      value: props.products.map((e) => e.manufacturers.title)
    },
    imgs: {
      title: 'Изображение',
      value: props.products.map((e) => e.img[0])
    },
    warranties: {
      title: 'Гарантия',
      value: props.products.map((e) => e.warranty),
      units: 'мес'
    },
    discounts: {
      title: 'Скидка',
      value: props.products.map((e) => e.discount),
      units: '%'
    },
    prices: {
      title: 'Цена',
      value: props.products.map((e) => e.price),
      units: '₽'
    }
  }
})
</script>

<template>
  <div
    v-if="loading === 'success'"
    class="table"
  >
    <div class="row">
      <div class="title cell">Наименование</div>
      <div class="cells">
        <div
          v-for="title in titles"
          :key="title"
          class="cell"
        >
          {{ title }}
        </div>
      </div>
    </div>
    <div
      v-for="(_, i) in specifications"
      :key="i"
      class="row"
    >
      <div class="title cell">{{ specifications[i].title }}</div>
      <div class="cells">
        <div
          v-for="(__, j) in products.length"
          :key="j"
          class="cell"
        >
          {{
            products[j].specifications[i]?.valueNumber ??
            products[j].specifications[i]?.valueString
          }}
          {{ specifications[i].units }}
        </div>
      </div>
    </div>
    <div
      v-for="data of basicData"
      :key="data.title"
      class="row"
    >
      <div class="title cell">{{ data.title }}</div>
      <div class="cells">
        <div
          v-for="value in data.value"
          :key="value"
          class="cell"
        >
          <template v-if="data.title === 'Изображение'">
            <img
              :src="String(value)"
              alt=""
            />
          </template>
          <template v-else> {{ value }} {{ data.units }} </template>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="cell title">Действия</div>
      <div class="cells">
        <div
          v-for="product in products"
          :key="product.id"
          class="cell"
        >
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
  </div>
  <div
    v-else-if="loading === 'empty'"
    class="text-2xl text-center font-normal mt-16"
  >
    товары отсутствуют
  </div>
  <div
    v-else
    class="h-[50vh] flex items-center"
  >
    <v-loader />
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