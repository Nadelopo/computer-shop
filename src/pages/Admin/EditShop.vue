<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getOneById, updateOneById } from '@/db/queries/tables'
import ShopsForm from '@/components/Admin/Shops/ShopsForm.vue'
import { VLoader } from '@/components/UI'
import type { ShopForm } from '@/components/Admin/Shops/types'
import type { Loading } from '@/types'

const route = useRoute()
const shopId = Number(route.params.id)
const form = ref<ShopForm>()
const loadingGet = ref<Loading>('loading')
onBeforeMount(async () => {
  const { data, error } = await getOneById('shops', shopId)
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
const router = useRouter()
const save = async () => {
  const formValue = form.value
  if (!formValue) return
  loadingSave.value = 'loading'
  const phone = Number(formValue.phone.replace(/[()\- ]/g, ''))
  const [start, end] = formValue.time.split(' - ')

  await updateOneById('shops', shopId, {
    address: formValue.address,
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
        v-model="form"
        type="update"
        :loading-submit="loadingSave === 'loading'"
        @submit="save"
      />
      <v-loader v-else />
    </div>
  </div>
</template>
