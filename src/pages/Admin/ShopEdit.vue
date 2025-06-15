<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { supabase } from '@/shared/api'
import { ShopEditor, type ShopForm } from '@/modules/shops'
import { VLoader } from '@/shared/components/UI'
import { useCustomRoute, useCustomRouter } from '@/shared/composables/customRouter'
import type { Loading } from '@/shared/types'

const route = useCustomRoute('EditShop')
const shopId = Number(route.params.id)
const form = ref<ShopForm>()
const loadingGet = ref<Loading>('loading')

onBeforeMount(async () => {
  const { data, error } = await supabase.from('shops').select().eq('id', shopId).single()
  if (error) {
    loadingGet.value = 'error'
    return
  }

  form.value = {
    address: data.address,
    phone: String(data.phone),
    time: `${data.timeStart.slice(0, 5)} - ${data.timeEnd.slice(0, 5)}`
  }
  loadingGet.value = 'success'
})

const loadingSave = ref<Loading>('success')
const router = useCustomRouter()

const save = async (values: ShopForm) => {
  loadingSave.value = 'loading'
  const phone = Number(values.phone.replace(/[()\- ]/g, ''))
  const [start, end] = values.time.split(' - ')

  await supabase.from('shops').update({
    address: values.address,
    phone,
    timeStart: `${start}:00`,
    timeEnd: `${end}:00`
  })
  await router.push({
    name: 'AdminShops'
  })
  loadingSave.value = 'success'
}
</script>

<template>
  <div class="pt-12">
    <div class="container">
      <ShopEditor
        v-if="form"
        :form-data="form"
        type="update"
        :loading-submit="loadingSave === 'loading'"
        @submit="save"
      />
      <VLoader v-else />
    </div>
  </div>
</template>
