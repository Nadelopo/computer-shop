<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue'
import type {
  YMap,
  LngLat,
  BehaviorMapEventHandler
} from '@yandex/ymaps3-types'
import {
  YandexMap,
  YandexMapDefaultSchemeLayer,
  YandexMapDefaultFeaturesLayer,
  YandexMapMarker,
  YandexMapListener
  // YandexMapClusterer
} from 'vue-yandex-maps'
import { getAll } from '@/db/queries/tables'

// Можно использовать для различных преобразований
const map = shallowRef<null | YMap>(null)

const markers = ref<LngLat[]>([])
onMounted(async () => {
  const { data } = await getAll('shops')
  const promises: Promise<Response>[] = []
  data?.forEach((shop) => {
    promises.push(
      fetch(
        `https://geocode-maps.yandex.ru/1.x/?apikey=${
          import.meta.env.VITE_MAPS_KEY
        }&geocode=Ульяновск+${shop.address}&format=json`
      )
    )
  })
  const result = await Promise.all(promises)
  const responses = (await Promise.all(result.map((r) => r.json()))).map(
    (j) => j.response
  )
  for (const response of responses) {
    markers.value.push(
      response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos
        .split(' ')
        .map(Number)
    )
  }
})

const openMarker = ref<null | number>(null)

const ZOOM_DEFAULT = 12
const zoom = ref(ZOOM_DEFAULT)
const onZoom: BehaviorMapEventHandler = (event) => {
  if (event.type !== 'scrollZoom') return
  zoom.value = event.location.zoom
}

// const clusterer = ref()
</script>

<template>
  {{ zoom }}
  <div style="display: flex">
    <yandex-map
      v-model="map"
      :settings="{
        location: {
          center: [48.54, 54.34],
          zoom: ZOOM_DEFAULT
        }
      }"
      width="100%"
      height="500px"
    >
      <yandex-map-default-features-layer />
      <!-- <yandex-map-clusterer
        v-model="clusterer"
        :grid-size="2 ** 6"
        zoom-on-cluster-click
      > -->
      <yandex-map-marker
        v-for="(marker, index) in markers"
        :key="index"
        :settings="{
          coordinates: marker
        }"
      >
        <div
          class="marker"
          @click="openMarker = index"
        >
          <div
            class="store__number"
            style=""
          >
            {{ index }}
          </div>
          <div class="dot" />
        </div>
        <div v-if="openMarker === index">
          <div
            class="popup"
            @click.stop="openMarker = null"
          >
            Click me to close popup
          </div>
        </div>
      </yandex-map-marker>

      <!-- <template #cluster="{ length }">
          <div
            class="cluster fade-in"
            :style="{
              // background: 'red'
            }"
          >
            {{ length }}
          </div>
        </template> -->
      <!-- </yandex-map-clusterer> -->
      <!-- <yandex-map-default-marker
        v-for="(marker, index) in pos"
        :key="index"
        :settings="{
          coordinates: marker,
          title: 'Marker with slot',
          subtitle: 'Marker with slot description',
          color: '#26A69A',
          popup: { position: 'top' }
        }"
      >
        <template #popup="{ close }">
          <div
            class="marker-popup"
            @click="close"
          >
            Click me to close popup
          </div>
        </template>
      </yandex-map-default-marker> -->
      <yandex-map-default-scheme-layer />
      <yandex-map-listener
        :settings="{
          onActionEnd: onZoom
        }"
      />
    </yandex-map>
  </div>
</template>

<style scoped lang="sass">
.marker
  background: var(--main)
  width: 38px
  height: 38px
  border-radius: 50%
  cursor: pointer
  display: flex
  justify-content: center
  align-items: center
  border: 3px solid #fff
  &:hover
    z-index: 10
  .store__number
    z-index: 1
    color: #fff
    font-size: 14px
  .dot
    position: absolute
    width: 26px
    height: 26px
    border-radius: 50%
    background: var(--main)
    border: 5px solid #fff

:global(.ymaps3x0--marker:hover)
  z-index: 10!important
</style>
