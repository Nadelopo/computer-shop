<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCartStore } from '@/stores/cartStore'
import { VButton, VLoader } from '@/components/UI'
import { TrashSvg } from '@/assets/icons'
import type { Loading } from '@/types'

const {
  setCartItemsWithDetails,
  increaseItemCount,
  reduceItemCount,
  setCartItems,
  deleteItem
} = useCartStore()
const { cartItemsWithDetails } = storeToRefs(useCartStore())

const loading = ref<Loading>('loading')

onBeforeMount(async () => {
  const { data, error } = await setCartItems()
  if (error) {
    loading.value = 'error'
    return
  }
  await setCartItemsWithDetails(data)
  loading.value = 'success'
})
</script>

<template>
  <div class="container">
    <div v-if="loading === 'success'" class="cart">
      <div>
        <div
          v-for="product in cartItemsWithDetails"
          :key="product.id"
          class="product__wrapper"
        >
          <div><img :src="product.img" alt="..." /></div>
          <div>{{ product.name }}</div>
          <div class="management">
            <v-button @click="reduceItemCount(product)">
              <!-- <svg width="40" viewBox="0 0 40 10">
                <line
                  x1="5"
                  y1="5"
                  x2="36"
                  y2="5"
                  stroke="#26a69a"
                  stroke-width="4"
                  stroke-linecap="round"
                />
              </svg> -->
              -
            </v-button>
            <div>{{ product.count }}</div>
            <v-button @click="increaseItemCount(product)"> + </v-button>
            <v-button @click="deleteItem(product.id)">
              <trash-svg />
            </v-button>
          </div>
        </div>
      </div>
      <div>
        <!-- <v-button> итого: </v-button> -->
      </div>
    </div>
    <div v-else-if="loading === 'loading'" class="h-screen flex items-center">
      <v-loader />
    </div>
    <div v-else-if="loading === 'error'"> ошибка </div>
  </div>
</template>

<style scoped lang="sass">

.cart
  display: grid
  grid-template-columns: 1fr 300px
  gap: 40px


.product__wrapper
  background: #fff
  box-shadow: 0px 0px 10px 4px rgba(0,0,0, 0.1 )
  border-radius: 8px
  display: grid
  grid-template-columns: 25% 1fr auto
  align-items: center
  transition: .3s
  padding: 20px
  margin-bottom: 30px
  &:hover
      box-shadow: rgb(0, 0, 0 , .25) 0px 0px 15px 5px
  img
    max-height: 200px

.management
  display: flex
  align-items: center
  gap: 10px
</style>
