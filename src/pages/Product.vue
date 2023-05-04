<script setup lang="ts">
import { onBeforeMount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useProductsStore } from '@/stores/productsStore'
import { useManufacturersStore } from '@/stores/manufacturersStore'
import { getAllByColumns } from '@/utils/queries/db'
import { formatPrice } from '@/utils/formatPrice'
import Rating from '@/components/Rating.vue'
import ButtonCart from '@/components/ButtonCart.vue'
import VButton from '@/components/UI/VButton.vue'
import FavouritesSVG from '@/assets/icons/favourites.svg?component'
import ComparisonSVG from '@/assets/icons/comparison.svg?component'
import type { ManufacturerRead } from '@/types/tables/manufacturers.types'
import type {
  ProductRead,
  ProductWithSpecifications
} from '@/types/tables/products.types'

const { getProduct } = useProductsStore()
const { getManufacturer } = useManufacturersStore()

const route = useRoute()

const id = ref(Number(route.params.productId))
const categoryId = Number(route.params.categoryId)
const categoryName = route.params.category

const product = ref<ProductWithSpecifications>()
const productPrice = ref('')
const manufacturer = ref<ManufacturerRead>()
const similarProducts = ref<ProductRead[]>([])

const loadData = async () => {
  const data = await getProduct(id.value)
  if (data.value) {
    data.value.specifications = data.value.specifications
      .map((e) => {
        const title = e.categorySpecificationsId.title
        e.categorySpecificationsId.title =
          title.charAt(0).toUpperCase() + title.slice(1)
        return e
      })
      .sort((a, b) =>
        a.categorySpecificationsId.title.localeCompare(
          b.categorySpecificationsId.title
        )
      )
    product.value = data.value

    const manufacturerData = await getManufacturer(data.value.manufacturerId.id)
    if (manufacturerData) {
      manufacturer.value = manufacturerData
    }

    const similar = await getAllByColumns<ProductRead>(
      'products',
      [
        {
          column: 'categoryId',
          value: categoryId
        }
      ],
      {
        between: {
          column: 'price',
          begin: data.value.price - 5000,
          end: data.value.price + 5000
        },
        limit: 4,
        neq: {
          column: 'id',
          value: product.value.id
        }
      }
    )
    if (similar) {
      similarProducts.value = similar
    }

    productPrice.value = formatPrice(product.value.price)
  }
}

onBeforeMount(loadData)

watch(
  () => route.params,
  (cur) => {
    id.value = Number(cur.productId)
    loadData()
    window.scroll(0, 0)
  }
)
</script>

<template>
  <div v-if="product && manufacturer" class="container">
    <div class="product__top wrapper">
      <img class="align-middle max-h-80" :src="product.img" alt="..." />
      <div class="w-full">
        <div class="flex justify-between gap-4">
          <div class="text-3xl">{{ product.name }}</div>
          <div>
            <img class="max-h-14" :src="manufacturer?.img" />
          </div>
        </div>
        <Rating :rating="product.rating" />
        <div class="text-4xl mb-4 mt-6">{{ productPrice }}</div>
        <div>
          <button-cart :width="400" :product-id="product.id" />
          <div class="list__btns">
            <v-button>
              <FavouritesSVG fill="#60efe1" />
              <span>в избранное</span>
            </v-button>
            <v-button>
              <ComparisonSVG fill="#60efe1" />
              <span>в сравнение</span>
            </v-button>
          </div>
        </div>
      </div>
    </div>
    <div class="wrapper grid">
      <div>Описание</div>
      <div class="text-xl leading-9">{{ product.description }}</div>
    </div>
    <div class="wrapper grid">
      <div>Характеристики</div>
      <div>
        <div
          v-for="specification in product.specifications"
          :key="specification.id"
          class="specification"
        >
          <div class="specification__title">
            {{ specification.categorySpecificationsId.title }}
          </div>
          <div class="flex items-end">
            {{ specification.valueNumber ?? specification.valueString }}
            {{ specification.categorySpecificationsId.units }}
          </div>
        </div>
        <div class="specification">
          <div class="specification__title">Производитель</div>
          <div class="flex items-end">{{ product.manufacturerId.title }}</div>
        </div>
        <div class="specification">
          <div class="specification__title">Гарантия</div>
          <div class="flex items-end">{{ product.warranty }} мес</div>
        </div>
      </div>
    </div>
    <div class="wrapper grid">
      <div>Похожие товары</div>
      <div class="similar__products">
        <div
          v-for="similarProduct in similarProducts"
          :key="similarProduct.id"
          class="similar"
        >
          <img :src="similarProduct.img" alt="" />
          <router-link
            :to="{
              name: 'Product',
              params: {
                category: categoryName,
                categoryId,
                productId: similarProduct.id
              }
            }"
          >
            {{ similarProduct.name }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="sass">
.wrapper
  background: #fff
  border-radius: 8px
  border: 1px solid #d9d9d9
  padding: 30px
  margin-bottom: 20px
  &.grid
    display: grid
    grid-template-columns: 250px 1fr
    & > div:first-child
      font-size: 30px

.product__top
  display: grid
  grid-template-columns: 1fr 1fr
  justify-items: center
  min-height: 350px
  align-items: center


.list__btns
  margin-top: 6px
  max-width: 400px
  display: grid
  grid-template-columns: 1fr 1fr
  gap: 6px
  button
    display: flex
    gap: 8px

.specification
  font-size: 18px
  margin-bottom: 14px
  display: grid
  grid-template-columns: 90% auto
  gap: 20px
  .specification__title
    border-bottom: 1px dotted #5e5e5e

.similar__products
  display: grid
  grid-template-columns: repeat(4, 1fr)
  gap: 20px
  .similar
    height: 230px
    display: grid
    grid-template-rows: 80% 1fr
    justify-items: center
    img
      max-width: 160px
      max-height: 150px
    a
      transition: .2s
      &:hover
        color: var(--color-text)
</style>
