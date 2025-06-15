<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'vue-toastification'
import { supabase } from '@/shared/api'
import { ShopEditor } from '@/modules/shops'
import ShopsList from './components/ShopsList.vue'
import type { ShopForm } from '@/modules/shops'
import type { Loading } from '@/types'
import type { ShopRead } from '@/modules/shops/model/shops.types'

const loadingSubmit = ref<Loading>('success')
const shops = ref<ShopRead[]>([])
const onSubmit = async (values: ShopForm, resetForm: () => void) => {
  loadingSubmit.value = 'loading'

  const phone = Number(values.phone.replace(/[()\- ]/g, ''))
  const [start, end] = values.time.split(' - ')

  const { data, error } = await supabase
    .from('shops')
    .insert({
      address: values.address,
      phone,
      timeStart: `${start}:00`,
      timeEnd: `${end}:00`
    })
    .select()
    .single()
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
  <ShopEditor
    :loading-submit="loadingSubmit === 'loading'"
    @submit="onSubmit"
  />
  <ShopsList v-model="shops" />
</template>
