<script setup lang="ts">
import { ref } from 'vue'
import ShopsForm from '@/components/Admin/Shops/ShopsForm.vue'
import { createOne } from '@/db/queries/tables'
import ShopsList from '@/components/Admin/Shops/ShopsList.vue'
import type { ShopForm } from '@/components/Admin/Shops/types'
import type { Loading } from '@/types'
import type { ShopRead } from '@/types/tables/shops.types'

const cleanForm = {
  address: '',
  time: '',
  phone: ''
}

const form = ref<ShopForm>({ ...cleanForm })

const loadingSubmit = ref<Loading>('success')
const shops = ref<ShopRead[]>([])
const onSubmit = async () => {
  loadingSubmit.value = 'loading'
  const formValue = form.value
  const phone = Number(formValue.phone.replace(/[()\- ]/g, ''))
  const [start, end] = formValue.time.split(' - ')
  const { data, error } = await createOne('shops', {
    address: formValue.address,
    phone,
    timeStart: `${start}:00`,
    timeEnd: `${end}:00`
  })
  if (error) {
    loadingSubmit.value = 'empty'
    return
  }
  shops.value.push(data)
  form.value = { ...cleanForm }
  loadingSubmit.value = 'success'
}
</script>

<template>
  <div>
    <shops-form
      v-model="form"
      :loading-submit="loadingSubmit === 'loading'"
      @submit="onSubmit"
    />
    <shops-list v-model="shops" />
  </div>
</template>
