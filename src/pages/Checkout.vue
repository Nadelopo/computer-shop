<script setup lang="ts">
import { onBeforeMount, ref, watch } from 'vue'
import { VButton, VButtons, VInputText, VLoader } from '@/components/UI'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/userStore'
import { useCartStore } from '@/stores/cartStore'
import { useChooseWord } from '@/components/Cart/useChooseWord'
import {
  createOne,
  getAll,
  getOneById,
  updateManyById,
  updateOneById
} from '@/db/queries/tables'
import { formatPrice } from '@/utils/formatPrice'
import Address from '@/components/Checkout/Address.vue'
import type { Loading } from '@/types'
import type { Location } from '@/components/Checkout/types'
import type { ProductRead } from '@/types/tables/products.types'
import type { OrderCreate } from '@/types/tables/orders.types'
import type { UserUpdate } from '@/types/tables/users.types'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'
import { supabase } from '@/db/supabase'
import { localStorageSet } from '@/utils/localStorage'
import { useGeoSuggest } from '@/utils/useGeoSuggest'

type UserContactData = {
  name: string
  email: string
  phone: string
  obtainType: 'selfcall' | 'delivery'
  location: Location
  shopAddress: string | null
}

const { user } = storeToRefs(useUserStore())
const userContactData = ref<UserContactData>({
  name: '',
  email: '',
  phone: '',
  obtainType: 'selfcall',
  location: {
    apartment: null,
    floor: null,
    entrance: null,
    address: '',
    city: ''
  },
  shopAddress: null
})

const loadingUserData = ref<Loading>('loading')
const watcher = watch(
  user,
  async (cur) => {
    if (!cur) return
    const { data, error } = await getOneById(
      'users',
      cur.id,
      'address, apartment, floor, entrance, city'
    )
    if (error) {
      loadingUserData.value = 'error'
      return
    }
    userContactData.value = {
      email: cur.email,
      name: cur.name,
      obtainType: 'selfcall',
      phone: cur.phone?.toString() ?? '',
      location: {
        city: data.city ?? 'Ульяновск',
        address: data.address ?? '',
        apartment: data.apartment,
        floor: data.floor,
        entrance: data.entrance
      },
      shopAddress: null
    }
    loadingUserData.value = 'success'
    watcher()
  },
  { immediate: true }
)

const { getMarkup, setCartItems } = useCartStore()
const { countCartItems, cartItems } = storeToRefs(useCartStore())

const price = ref(0)
const loadingPrice = ref<Loading>('loading')
const products = ref<
  Pick<ProductRead, 'id' | 'price' | 'name' | 'img' | 'quantity'>[]
>([])
onBeforeMount(async () => {
  await setCartItems()
  const { data, error } = await getAll('products', {
    in: {
      id: cartItems.value.map((e) => e.productId)
    },
    select: 'id, price, quantity, name, img '
  })
  if (error) {
    loadingPrice.value = 'error'
    return
  }
  products.value = data
  price.value += data.reduce((a, b) => {
    const item = cartItems.value.find((e) => e.productId === b.id)
    if (!item) return a
    const markup = getMarkup(item.additionalWarranty, b.price)
    return a + b.price * item.count + markup
  }, 0)
  loadingPrice.value = 'success'
})

const { chooseWord } = useChooseWord()

const updatePriductQuantity = () => {
  const items: Pick<ProductRead, 'id' | 'quantity'>[] = []
  for (const product of products.value) {
    const count = cartItems.value.find((e) => e.productId === product.id)?.count
    if (count === undefined) continue
    items.push({
      id: product.id,
      quantity: product.quantity - count
    })
  }
  return updateManyById('products', items)
}

const updateUserData = async (phone: number) => {
  if (!user.value) return
  const { data, error: getUserError } = await getOneById(
    'users',
    user.value.id,
    'address'
  )
  if (getUserError) return
  const {
    obtainType,
    location: { address, city, apartment, floor, entrance }
  } = userContactData.value
  let updateData: UserUpdate = {}
  if (!data.address && obtainType === 'delivery') {
    updateData = {
      address,
      city,
      apartment: apartment || null,
      floor: floor || null,
      entrance: entrance || null
    }
  }
  if (!user.value.phone) {
    updateData.phone = phone
  }
  updateOneById('users', user.value.id, updateData)
}

const loadingCreateOrder = ref<Loading>('success')
const router = useRouter()
const onSubmit = async () => {
  const userContactDataValue = userContactData.value
  const {
    name,
    email,
    obtainType,
    shopAddress,
    location: { address, apartment, floor, entrance, city }
  } = userContactDataValue
  const phone = Number(userContactDataValue.phone.replace(/[()\- ]/g, ''))

  loadingCreateOrder.value = 'loading'
  if (obtainType === 'selfcall') {
    if (userContactDataValue.shopAddress === null) {
      useToast().warning('Выберите магазин')
      loadingCreateOrder.value = 'success'
      return
    }
  } else {
    const { data } = await useGeoSuggest({
      text: userContactDataValue.location.address
    })
    const findedAddress = data?.find(
      (e) => e.title.text === userContactDataValue.location.address
    )
    console.log(findedAddress)
    if (!findedAddress) {
      useToast().warning('Адрес не найден')
      loadingCreateOrder.value = 'success'
      return
    }
  }
  updateUserData(phone)
  const orderedProducts = cartItems.value.map((e) => {
    const price = products.value.find((p) => p.id === e.productId)?.price ?? 0
    return {
      productId: e.productId,
      count: e.count,
      price
    }
  })

  const order: OrderCreate = {
    userId: user.value?.id ?? null,
    phone: user.value ? null : phone,
    email: user.value ? null : email,
    name: user.value ? null : name,
    address: user.value ? null : address,
    apartment: user.value ? null : apartment,
    city: user.value ? null : city,
    entrance: user.value ? null : entrance,
    floor: user.value ? null : floor,
    type: obtainType,
    deliveryDate: obtainType === 'delivery' ? new Date() : null,
    shopAddress: obtainType === 'selfcall' ? shopAddress : null,
    status: 'awaiting',
    price: price.value,
    orderedProducts
  }
  const { error } = await createOne('orders', order)
  if (error) {
    loadingCreateOrder.value = 'error'
    useToast().error('Произошла ошибка')
    return
  }
  if (user.value) {
    await supabase.from('cart').delete().match({ userId: user.value.id })
  } else {
    localStorageSet('cart', [])
  }
  await updatePriductQuantity()
  router.push('Cart')
}
</script>

<template>
  <form
    v-if="loadingPrice === 'success' && loadingUserData === 'success'"
    class="container"
    @submit.prevent="onSubmit"
  >
    <div class="font-medium text-3xl mb-4"> Оформление заказа </div>
    <div class="block">
      <div class="label">
        <div>1.</div>
        <div> Данные покупателя </div>
      </div>
      <div class="content grid grid-cols-1 gap-6 xs:grid-cols-2">
        <div>
          <div>Имя*</div>
          <v-input-text v-model="userContactData.name" />
        </div>
        <div>
          <div>Почта*</div>
          <v-input-text v-model="userContactData.email" />
        </div>
        <div>
          <div>Телефон*</div>
          <v-input-text
            v-model="userContactData.phone"
            type="tel"
            :show-spin-buttons="false"
            pattern=".{17,}"
          />
        </div>
      </div>
    </div>
    <div class="block">
      <div class="label">
        <div>2.</div>
        <div>Способ получения</div>
      </div>
      <div class="content">
        <div>
          <v-buttons
            v-model="userContactData.obtainType"
            :options="[
              { title: 'Самовызов', value: 'selfcall' },
              { title: 'Доставка', value: 'delivery' }
            ]"
          />
        </div>
        <Address
          v-model="userContactData.location"
          v-model:shop-address="userContactData.shopAddress"
          :obtain-type="userContactData.obtainType"
        />
      </div>
    </div>
    <div class="block">
      <div class="label">
        <div>3.</div>
        <div>Выберите способ оплаты</div>
      </div>
      <div class="content">
        <v-button>при получении</v-button>
      </div>
    </div>
    <div>
      <div
        class="content"
        style="border-left: unset"
      >
        <div> {{ countCartItems }} {{ chooseWord }}</div>
        <div class="text-3xl font-medium mb-2">
          Итого: <span class="font-bold">{{ formatPrice(price) }}</span>
        </div>
        <v-button
          type="submit"
          :loading="loadingCreateOrder === 'loading'"
        >
          Оформить заказ
        </v-button>
      </div>
    </div>
  </form>
  <div
    v-else
    class="flex justify-center items-center h-[50vh]"
  >
    <v-loader />
  </div>
</template>

<style scoped lang="sass">
.block
  max-width: 900px
  margin-bottom: 30px

.label
  display: flex
  gap: 8px
  margin-bottom: 12px
  font-size: 24px
  div:first-child
    width: 20px

.content
  padding-left: 23px
  padding-right: 23px
  border-left: 1px solid #d9d9d9
  margin-left: 5px
</style>
