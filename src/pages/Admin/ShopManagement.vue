<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'vue-toastification'
import { createOne } from '@/db/queries/tables'
import ShopsForm from '@/components/Admin/Shops/ShopsForm.vue'
import ShopsList from '@/components/Admin/Shops/ShopsList.vue'
import type { ShopForm } from '@/components/Admin/Shops/types'
import type { Loading } from '@/types'
import type { ShopRead } from '@/types/tables/shops.types'

const loadingSubmit = ref<Loading>('success')
const shops = ref<ShopRead[]>([])
const onSubmit = async (values: ShopForm, resetForm: () => void) => {
  loadingSubmit.value = 'loading'
  const phone = Number(values.phone.replace(/[()\- ]/g, ''))
  const [start, end] = values.time.split(' - ')
  const { data, error } = await createOne('shops', {
    address: values.address,
    phone,
    timeStart: `${start}:00`,
    timeEnd: `${end}:00`
  })
  if (error) {
    if (error.code === '23505') {
      useToast().error('Магазиг уже существует')
      loadingSubmit.value = 'error'
    }
    return
  }
  shops.value.push(data)
  resetForm()
  loadingSubmit.value = 'success'
}
</script>

<template>
  <shops-form
    :loading-submit="loadingSubmit === 'loading'"
    @submit="onSubmit"
  />
  <shops-list v-model="shops" />
</template>
