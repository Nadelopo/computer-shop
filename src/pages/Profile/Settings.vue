<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { useForm } from 'vee-validate'
import { useToast } from 'vue-toastification'
import { useUserStore } from '@/stores/userStore'
import { getOneById, updateOneById } from '@/db/queries/tables'
import { string } from '@/utils/validator'
import { VLoader } from '@/components/UI'
import FormField from '@/components/FormField.vue'
import { VButton } from '@/components/UI'
import type { User } from '@supabase/supabase-js'
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
    name: (v?: string) => string(v).required().onlyLetters().valid(),
    // email: (v?: string) => string(v).required().email().valid(),
    phone: (v?: string) => string(v).phone()
  }
})

const loading = ref<Loading>('loading')
let user: User | null = null
onBeforeMount(async () => {
  user = await isUserAuthenticated()
  if (!user) return

  const { data, error } = await getOneById(
    'users',
    user.id,
    'address,apartment, floor, entrance, phone, name'
  )
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
  const { error } = await updateOneById('users', user.id, {
    name,
    phone,
    address: address || null,
    apartment: apartment || null,
    entrance: entrance || null,
    floor: floor || null
  })
  if (error) {
    loadingSubmit.value = 'error'
    return
  }
  loadingSubmit.value = 'success'
  useToast().success('Данные успешно обновлены')
  console.log(phone)
  console.log(values)
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
      />
      <form-field
        name="floor"
        label="Этаж"
        type="number"
      />
      <form-field
        name="entrance"
        label="Подъезд"
        type="number"
      />
      <div>
        <v-button :loading="loadingSubmit === 'loading'"> сохранить </v-button>
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
