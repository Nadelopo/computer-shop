<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { useForm } from 'vee-validate'
import { string } from 'yup'
import { useToast } from 'vue-toastification'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/db/supabase'
import { useUserStore } from '@/stores/userStore'
import { VLoader, VButton } from '@/components/UI'
import FormField from '@/components/FormField.vue'
import type { Loading } from '@/types'

const { isUserAuthenticated } = useUserStore()

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
  user = await isUserAuthenticated()
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
      <form-field
        name="name"
        label="Имя*"
      />
      <!-- <form-field
        name="email"
        label="Почта*"
      /> -->
      <form-field
        name="phone"
        label="Телефон*"
        type="tel"
      />
      <form-field
        name="address"
        label="Адрес"
      />
      <form-field
        name="apartment"
        label="Квартира"
        type="number"
        min="0"
      />
      <form-field
        name="floor"
        label="Этаж"
        type="number"
        min="0"
      />
      <form-field
        name="entrance"
        label="Подъезд"
        type="number"
        min="0"
      />
      <div>
        <v-button
          type="submit"
          :loading="loadingSubmit === 'loading'"
        >
          сохранить
        </v-button>
      </div>
    </form>
  </div>
  <div
    v-else
    class="h-[50vh] flex place-items-center"
  >
    <v-loader />
  </div>
</template>

<style scoped lang="sass"></style>
