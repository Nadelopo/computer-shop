<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { supabase } from '@/db/supabase'
import { useCustomRoute, useCustomRouter } from '@/utils/customRouter'
import ShopsForm from '@/components/Admin/Shops/ShopsForm.vue'
import { VLoader } from '@/components/UI'
import type { ShopForm } from '@/components/Admin/Shops/types'
import type { Loading } from '@/types'

const route = useCustomRoute('EditShop')
const shopId = Number(route.params.id)
const form = ref<ShopForm>()
const loadingGet = ref<Loading>('loading')

onBeforeMount(async () => {
  const { data, error } = await supabase
    .from('shops')
    .select()
    .eq('id', shopId)
    .single()
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
      <shops-form
        v-if="form"
        :form-data="form"
        type="update"
        :loading-submit="loadingSave === 'loading'"
        @submit="save"
      />
      <v-loader v-else />
    </div>
  </div>
</template>
