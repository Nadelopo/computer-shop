<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/userStore'
import FavouriteSVG from '@/assets/icons/favourites.svg'
import { ref } from 'vue'
import { getOneById, updateOne } from '@/utils/queries/db'

const props = defineProps<{
  productId: number
}>()

const { user } = storeToRefs(useUserStore())

const productId = user.value?.favourites.find((e) => e === props.productId)

const state = ref(productId ? true : false)

const fill = ref(productId ? 'var(--color-main)' : 'var(--gray)')

const add = async () => {
  if (user.value) {
    const favourites =
      (await getOneById('users', user.value.id, { select: 'favourites' }))
        ?.favourites || []

    const isFavourite = favourites.includes(props.productId)

    if (state.value) {
      if (isFavourite) {
        const data = await updateOne('users', user.value.id, {
          favourites: user.value.favourites.filter((e) => e !== props.productId)
        })
        if (data) {
          user.value.favourites = data.favourites
          fill.value = 'var(--gray)'
          state.value = false
        }
      } else {
        user.value.favourites = favourites
        fill.value = 'var(--gray)'
        state.value = false
      }
    } else {
      if (isFavourite) {
        user.value.favourites = favourites
        fill.value = 'var(--color-main)'
        state.value = true
      } else {
        const data = await updateOne('users', user.value.id, {
          favourites: [...user.value.favourites, props.productId]
        })
        if (data) {
          user.value.favourites = data.favourites
          fill.value = 'var(--color-main)'
          state.value = true
        }
      }
    }
  }
}
</script>

<template>
  <FavouriteSVG class="favourite__btn" width="30" @click.prevent="add" />
</template>

<style scoped lang="sass">
.favourite__btn
  fill: v-bind(fill)
  transition: .2s
  &:hover
    fill: var(--color-main)
</style>
