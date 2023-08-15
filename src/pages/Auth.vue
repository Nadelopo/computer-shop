<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { supabase } from '@/supabase'
import { createOne } from '@/utils/queries/db'
import { VButton } from '@/components/UI'

const router = useRouter()

const active = ref(true)
const email = ref('')
const password = ref('')
const name = ref('')

const toast = useToast()

const signIn = async () => {
  if (email.value && password.value) {
    const { user, error } = await supabase.auth.signIn({
      email: email.value,
      password: password.value
    })
    if (error) {
      console.log(error)
      toast.warning('Неверная почта или пароль')
    }
    if (user) {
      router.push({ name: 'Home' })
    }
  } else {
    toast.warning('Не все поля заполнены')
  }
}

const signUp = async () => {
  if (email.value && password.value && name.value) {
    const { user, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value
    })
    if (error) {
      console.log(error)
      toast.warning('Пользователь уже зарегестрирован')
    }
    if (!user) return
    const insertData = await createOne('users', {
      name: name.value,
      email: email.value,
      id: user.id
    })
    if (insertData) {
      router.push({ name: 'Home' })
    }
  } else {
    toast.warning('Не все поля заполнены')
  }
}
</script>

<template>
  <div class="back">
    <form class="main" @submit.prevent="active ? signIn() : signUp()">
      <div class="head">
        <div
          class="cursor-pointer uppercase text"
          :class="{ active }"
          @click="active = true"
        >
          войти
        </div>
        <div
          class="cursor-pointer uppercase text"
          :class="{ active: !active }"
          @click="active = false"
        >
          зарегистрироваться
        </div>
      </div>
      <div v-if="!active" class="flex flex-col mb-4">
        <label class="label" for="">ИМЯ</label>
        <input
          v-model="name"
          class="input"
          type="text"
          minlength="4"
          maxlength="50"
        />
      </div>
      <div class="flex flex-col mb-4">
        <label class="label" for="">ПОЧТА</label>
        <input v-model="email" class="input" type="email" />
      </div>
      <div class="flex flex-col">
        <label class="label" for="">ПАРОЛЬ</label>
        <input
          v-model="password"
          class="input"
          type="password"
          minlength="6"
          maxlength="50"
        />
      </div>
      <div class="my-10">
        <v-button class="btnn">
          {{ active ? 'Войти' : 'Зарегистрироваться' }}
        </v-button>
      </div>
      <hr class="mb-4" />
      <div v-if="active" class="text-center">
        <span
          class="link cursor-pointer"
          @click="$router.push({ name: 'Reset' })"
        >
          Забыли пароль?
        </span>
      </div>
      <div class="text-center mt-2" @click="$router.push('/')">
        <span class="link cursor-pointer">Назад</span>
      </div>
    </form>
  </div>
</template>

<style scoped lang="sass">
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
  // min-height: 500px
  max-width: 400px
  width: 100%
  background:  linear-gradient( rgba(38, 166, 154, .8), rgb(32, 95, 109, .8))
  border-radius: 10px
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
  border-radius: 20px
  padding-left: 20px
  transition: 0.3s linear
  &:focus
      background: rgba(255,255,255,.3)
      transition: 0.3s linear

.btnn
  height: 40px
  width: 100%
  border-radius: 20px

.link
  color: rgba(255,255,255, .75)
  transition: .2s linear
  &:hover
    color: rgba(255,255,255, 1)
    transition: .2s linear
</style>
