<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'vue-toastification'
import { useField, useForm } from 'vee-validate'
import { string } from 'yup'
import { supabase } from '@/db/supabase'
import { createOne } from '@/db/queries/tables'
import { useCustomRouter } from '@/utils/useCustomRouter'
import { VButton } from '@/components/UI'

const router = useCustomRouter()

const isSignIn = ref(true)

const { handleSubmit } = useForm<{
  email: string
  password: string
  name: string
}>()

const { value: email, errorMessage: errorEmail } = useField<string>(
  'email',
  string().required().email()
)
const { value: password, errorMessage: errorPassword } = useField<string>(
  'password',
  string().required().min(6).max(50)
)
const { value: name, errorMessage: errorName } = useField<string>(
  'name',
  string().when({
    is: () => !isSignIn.value,
    then: () => string().required().onlyLetters().min(2).max(50)
  })
)

const toast = useToast()

const signIn = async () => {
  const {
    data: { user },
    error
  } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })
  if (error) {
    console.error(error)
    toast.warning('Неверная почта или пароль')
  }
  if (user) {
    router.push({ name: 'Home' })
  }
}

const signUp = async () => {
  const {
    data: { user },
    error
  } = await supabase.auth.signUp({
    email: email.value,
    password: password.value
  })
  if (error) {
    console.error(error)
    toast.warning('Пользователь уже зарегестрирован')
  }
  if (!user) return
  const { error: errorCreate } = await createOne('users', {
    name: name.value,
    email: email.value,
    id: user.id
  })
  if (!errorCreate) {
    router.push({ name: 'Home' })
  }
}

const submit = handleSubmit(() => {
  if (isSignIn.value) signIn()
  else signUp()
})
</script>

<template>
  <div class="back">
    <form
      class="main"
      @submit.prevent="submit"
    >
      <div class="head">
        <div
          class="cursor-pointer uppercase text"
          :class="{ isSignIn: isSignIn }"
          @click="isSignIn = true"
        >
          войти
        </div>
        <div
          class="cursor-pointer uppercase text"
          :class="{ active: !isSignIn }"
          @click="isSignIn = false"
        >
          зарегистрироваться
        </div>
      </div>
      <div
        v-if="!isSignIn"
        class="flex flex-col"
      >
        <label
          class="label"
          for="name"
        >
          ИМЯ
        </label>
        <input
          id="name"
          v-model="name"
          class="input"
          name="name"
          type="text"
        />
        <div class="text-danger-light pl-4 h-6">{{ errorName }}</div>
      </div>
      <div class="flex flex-col">
        <label
          class="label"
          for="email"
        >
          ПОЧТА
        </label>
        <input
          id="email"
          v-model="email"
          name="email"
          class="input"
          type="email"
        />
        <div class="text-danger-light pl-4 h-6">{{ errorEmail }}</div>
      </div>
      <div class="flex flex-col">
        <label
          class="label"
          for="password"
        >
          ПАРОЛЬ
        </label>
        <input
          v-model="password"
          class="input"
          name="password"
          type="password"
        />
        <div class="text-danger-light pl-4 h-6">{{ errorPassword }}</div>
      </div>
      <div class="mb-6 mt-4">
        <v-button class="btnn">
          {{ isSignIn ? 'Войти' : 'Зарегистрироваться' }}
        </v-button>
      </div>
      <hr class="mb-4" />
      <div
        v-if="isSignIn"
        class="text-center"
      >
        <span
          class="link cursor-pointer"
          @click="$router.push({ name: 'Reset' })"
        >
          Забыли пароль?
        </span>
      </div>
      <div
        class="text-center mt-2"
        @click="$router.push('/')"
      >
        <span class="link cursor-pointer">Назад</span>
      </div>
    </form>
  </div>
</template>

<style scoped lang="sass">
$radius: 12px
.back
  background:  linear-gradient(45deg, rgba(38, 166, 154, .8), rgb(32, 95, 109, .8))
  height: 100vh
  display: flex
  align-items: center
  justify-content: center
  padding: 0 10px

.main
  display: flex
  flex-direction: column
  max-width: 400px
  width: 100%
  background:  linear-gradient( rgba(38, 166, 154, .8), rgb(32, 95, 109, .8))
  border-radius: 8px
  padding: 30px
  color: #fff
  transition: .3s
  animation: main .4s ease
  @keyframes main
    0%
      transform: perspective(2500px) rotateY(-90deg)
    100%
      transform: perspective(2500px) rotateY(0)
  @media (width < 370px)
    padding: 20px


.head
  display: grid
  grid-template-columns: 60px auto
  margin-bottom: auto
  margin-bottom: 50px

.text
  padding-left: 16px
  color: rgba(255,255,255, 0.7)
  transition: .3s
  &.active
    color: rgba(255,255,255, 1)

.label
  font-size: 14px
  color: rgba(255,255,255,.8)
  margin: 0 0 4px 16px

hr
  border: none
  height: 1px
  background: rgba(255,255,255, .4)

.input
  outline: none
  border: none
  color: #fff
  background: rgba(255,255,255,.2)
  height: 35px
  border-radius: $radius
  padding-left: 20px
  transition: 0.3s linear
  &:focus
      background: rgba(255,255,255,.3)
      transition: 0.3s linear

.btnn
  height: 40px
  width: 100%
  border-radius: $radius

.link
  color: rgba(255,255,255, .75)
  transition: .2s linear
  &:hover
    color: rgba(255,255,255, 1)
    transition: .2s linear
</style>
