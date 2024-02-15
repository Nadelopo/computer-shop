<script setup lang="ts">
import { ref, watch } from 'vue'
import { VInputText, VButton, VModal, VLoader } from '../UI'
import { getAll } from '@/db/queries/tables'
import { LocationResult, useGeoSuggest } from '@/utils/useGeoSuggest'
import InputAddress from '@/components/InputAddress.vue'
import { CrossSvg, HomeSvg } from '@/assets/icons'
import { formatTime } from '@/utils/formatTime'
import type { ShopRead } from '@/types/tables/shops.types'
import type { Loading } from '@/types'
import type { Location } from './types'

defineProps<{
  obtainType: 'selfcall' | 'delivery'
}>()

const address = defineModel<Location>({
  required: true
})

const shopAddress = defineModel<string | null>('shopAddress', {
  required: true
})

const locationResults = ref<LocationResult['results'] | null>(null)

watch(
  () => address.value.address,
  async (location) => {
    const { data } = await useGeoSuggest({
      text: `${address.value.city} ${location}`,
      type: 'house'
    })
    locationResults.value = data
    console.log(data)
  }
)

const shops = ref<ShopRead[]>([])
const loadingShops = ref<Loading>('loading')
const loadShops = async () => {
  const { data, error } = await getAll('shops')
  if (error) return
  shops.value = data
  loadingShops.value = 'success'
}

const isModalOpen = ref(false)
const toggleModal = () => {
  isModalOpen.value = !isModalOpen.value
  loadingMap.value = false
  if (shops.value.length) return
  loadShops()
}

const loadingMap = ref(false)
const onMapLoad = () => {
  loadingMap.value = true
}
</script>

<template>
  <div
    v-if="obtainType === 'delivery'"
    ref="testRef"
    class="grid grid-cols-1 gap-6 mt-4 sm:grid-cols-2"
  >
    <input-address
      v-model="address.address"
      :location-results="locationResults"
      text="Адрес*"
      @click-on-suggestion="address.address = $event"
    />
    <div>
      <div>Квартира*</div>
      <v-input-text
        v-model="address.apartment"
        type="number"
        min="0"
      />
    </div>
    <div>
      <div>Этаж</div>
      <v-input-text
        v-model="address.floor"
        type="number"
        min="0"
        :required="false"
      />
    </div>
    <div>
      <div>Подъезд</div>
      <v-input-text
        v-model="address.entrance"
        type="number"
        min="0"
        :required="false"
      />
    </div>
  </div>
  <div v-else>
    <div class="choose__option">
      <div>
        <div class="flex justify-center mb-2">
          <home-svg
            fill="black"
            width="50"
          />
        </div>
        <button
          class="choose__option__btn"
          type="button"
          @click="toggleModal"
        >
          {{ shopAddress || 'Выберите пунк самовызова' }}
        </button>
        <v-modal v-model="isModalOpen">
          <div class="modal__content">
            <div class="flex">
              <ul class="ml-2 mr-6 w-full">
                <li
                  v-for="shop in shops"
                  :key="shop.id"
                >
                  <div>Магазин, {{ shop.address }}</div>
                  <div>
                    {{ formatTime(shop.timeStart, shop.timeEnd) }}
                  </div>
                  <v-button
                    class="mt-2"
                    @click=";(shopAddress = shop.address), toggleModal()"
                  >
                    Выбрать
                  </v-button>
                </li>
              </ul>
              <div class="ml-auto block md:hidden">
                <CrossSvg @click="toggleModal" />
              </div>
            </div>
            <div
              v-show="loadingMap && loadingShops === 'success'"
              class="flex justify-center items-center"
            >
              <iframe
                src="https://yandex.ru/map-widget/v1/?um=constructor%3A3b411b61aeb6a307ac31c151dfc3b1ab5d3112f10702e0cf3baf14dd3a81ef39&amp;source=constructor"
                width="100%"
                height="100%"
                frameborder="0"
                @load="onMapLoad"
              />
            </div>
            <div
              v-if="!loadingMap || loadingShops === 'loading'"
              class="flex justify-center items-center"
            >
              <v-loader />
            </div>
          </div>
        </v-modal>
      </div>
    </div>
  </div>
</template>

<style scoped lang="sass">
.choose__option
  display: flex
  justify-content: center
  align-items: center
  margin: 30px 0
  border-radius: 6px
  border: 1px solid #9e9e9e
  width: 100%
  max-width: 630px
  height: 300px
  &__btn
    border-radius: 4px
    border: 1px solid #9e9e9e
    padding: 0 6px
    transition: .2s
    &:hover
      background: #ddd

.modal__content
  padding: 16px
  display: grid
  grid-template-columns: minmax(300px, 400px) minmax(400px,1000px)
  @media (width < 768px)
    grid-template-columns: minmax(0,500px)
  li
    margin: 8px 0
    padding: 8px 0
    border-top: 1px solid var(--gray)
    &:last-child
      border-bottom: 1px solid var(--gray)
</style>
