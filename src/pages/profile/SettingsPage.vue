<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { useForm } from 'vee-validate'
import { string } from 'yup'
import { useToast } from 'vue-toastification'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/shared/api'
import { useUserStore } from '@/modules/users'
import { VLoader, VButton } from '@/components/UI'
import FormField from '@/components/FormField.vue'
import type { Loading } from '@/types'

const { getSessionUser } = useUserStore()

type Form = {
  // email: string
  name: string
  phone: string | null
  address: string | null
  apartment: number | null
  floor: number | null
  entrance: number | null
}

const { handleSubmit, setValues } = useForm<Form>({
  initialValues: {
    // email: '',
    name: '',
    phone: null,
    address: null,
    apartment: null,
    floor: null,
    entrance: null
  },
  validationSchema: {
    name: string().required().onlyLetters(),
    phone: string().phone()
    // email: (v?: string) => string(v).required().email().valid(),
  }
})

const loading = ref<Loading>('loading')
let user: User | null = null
onBeforeMount(async () => {
  user = await getSessionUser()
  if (!user) return

  const { data, error } = await supabase
    .from('users')
    .select('address,apartment, floor, entrance, phone, name')
    .eq('id', user.id)
    .single()
  if (error) {
    loading.value = 'error'
    return
  }

  setValues({
    // email: data.email,
    name: data.name,
    phone: data.phone?.toString() ?? null,
    address: data.address,
    apartment: data.apartment,
    floor: data.floor,
    entrance: data.entrance
  })

  loading.value = 'success'
})

const loadingSubmit = ref<Loading>('success')
const submit = handleSubmit(async (values) => {
  loadingSubmit.value = 'loading'

  if (!user) return

  const phone = Number(values.phone?.replace(/[()\- ]/g, ''))
  const { name, address, apartment, entrance, floor } = values

  const { error } = await supabase
    .from('users')
    .update({
      name,
      phone,
      address: address || null,
      apartment: apartment || null,
      entrance: entrance || null,
      floor: floor || null
    })
    .eq('id', user.id)
  if (error) {
    loadingSubmit.value = 'error'
    return
  }

  loadingSubmit.value = 'success'
  useToast().success('Данные успешно обновлены')
})
</script>

<template>
  <div v-if="loading === 'success'">
    <h1 class="text-4xl font-bold mb-10">Настройки профиля</h1>
    <form
      class="max-w-lg list__form"
      @submit.prevent="submit"
    >
      <FormField
        name="name"
        label="Имя*"
      />
      <!-- <form-field
        name="email"
        label="Почта*"
      /> -->
      <FormField
        name="phone"
        label="Телефон*"
        type="tel"
      />
      <FormField
        name="address"
        label="Адрес"
      />
      <FormField
        name="apartment"
        label="Квартира"
        type="number"
        min="0"
      />
      <FormField
        name="floor"
        label="Этаж"
        type="number"
        min="0"
      />
      <FormField
        name="entrance"
        label="Подъезд"
        type="number"
        min="0"
      />
      <div>
        <VButton
          type="submit"
          :loading="loadingSubmit === 'loading'"
        >
          сохранить
        </VButton>
      </div>
    </form>
  </div>
  <div
    v-else
    class="h-[50vh] flex place-items-center"
  >
    <VLoader />
  </div>
</template>

<style scoped lang="sass"></style>
