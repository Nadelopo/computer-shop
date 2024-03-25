<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'vue-toastification'
import { storeToRefs } from 'pinia'
import { supabase } from '@/db/supabase'
import { useUserStore } from '@/stores/userStore'
import { useCartStore } from '@/stores/cartStore'
import { getWordByQuantity } from '@/components/Cart/useChooseWord'
import {
  createMany,
  createOne,
  getOneById,
  updateManyById,
  updateOneById
} from '@/db/queries/tables'
import { useCustomRouter } from '@/utils/useCustomRouter'
import { formatPrice } from '@/utils/formatPrice'
import { VButton, VButtons, VLoader } from '@/components/UI'
import { useLocalStorage } from '@/utils/localStorage'
import { useGeoSuggest } from '@/utils/useGeoSuggest'
import MethodObtain from '@/components/Checkout/MethodObtain.vue'
import FormField from '@/components/FormField.vue'
import { OrderData, useFeatureForm } from '@/components/Checkout/useFeatureForm'
import { useFeaturePrice } from '@/components/Checkout/useFeaturePrice'
import { useFeatureInitialUserDataInstallation } from '@/components/Checkout/useFeatureInitialUserDataInstallation'
import type { Loading } from '@/types'
import type { ProductRead } from '@/types/tables/products.types'
import type { OrderCreate } from '@/types/tables/orders.types'
import type { UserUpdate } from '@/types/tables/users.types'
import type { OrderedProductCreate } from '@/types/tables/orderedProducts.types'

const { values, handleSubmit, setFieldValue, setValues } = useFeatureForm()
const { loadingUserData } = useFeatureInitialUserDataInstallation(
  setValues,
  values
)
const { price, loadingPrice, products } = useFeaturePrice()

const { countCartItems, cartItems } = storeToRefs(useCartStore())

const { user } = storeToRefs(useUserStore())
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
    receiptDetails: { address, city, apartment, floor, entrance }
  } = values
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
  if (Object.keys(updateData).length === 0) return
  updateOneById('users', user.value.id, updateData)
}

const loadingCreateOrder = ref<Loading>('success')
const toast = useToast()
const checkAddressValid = async (
  address: string | null,
  city: string | null,
  obtainType: OrderData['obtainType']
): Promise<boolean> => {
  if (obtainType === 'selfcall') return true
  const { data } = await useGeoSuggest({
    text: address ? `${city} ${address}` : '',
    type: 'house'
  })
  const findedAddress = data?.find((e) => e.title.text === address)
  if (!findedAddress) {
    toast.warning('Адрес не найден')
    loadingCreateOrder.value = 'success'
    return false
  }
  return true
}

const updateProductQuantity = () => {
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
const addOrderedProducts = async (orderId: number) => {
  const orderedProducts: Omit<OrderedProductCreate, 'orderId'>[] =
    cartItems.value.map((e) => {
      const product = products.value.find((p) => p.id === e.productId)
      const additionalWarranty =
        cartItems.value.find((p) => p.productId === e.productId)
          ?.additionalWarranty ?? 0
      return {
        productId: e.productId,
        count: e.count,
        price: product?.price ?? 0,
        additionalWarranty,
        servicePrice: getMarkup(additionalWarranty, product?.price ?? 0)
      }
    })
  const { error: errorOrderedProducts } = await createMany(
    'ordered_products',
    orderedProducts.map((e) => ({ ...e, orderId }))
  )
  if (errorOrderedProducts) {
    loadingCreateOrder.value = 'error'
    toast.error('Произошла ошибка')
    return
  }
  if (user.value) {
    await supabase.from('cart').delete().match({ userId: user.value.id })
  } else {
    useLocalStorage('cart').set([])
  }
  await updateProductQuantity()
}

const router = useCustomRouter()
const { getMarkup } = useCartStore()
const onSubmit = handleSubmit(async () => {
  const {
    name,
    email,
    obtainType,
    //prettier-ignore
    receiptDetails: { address, apartment, floor, entrance, city, deliveryDate, shopAddress }
  } = values
  const phone = Number(values.phone.replace(/[()\- ]/g, ''))
  loadingCreateOrder.value = 'loading'
  const isAddressValid = await checkAddressValid(address, city, obtainType)
  if (!isAddressValid) return
  updateUserData(phone)
  //prettier-ignore
  const formatDate = `${deliveryDate.getFullYear()}-${ deliveryDate.getMonth() + 1}-${deliveryDate.getDate()}`
  const order: OrderCreate = {
    userId: user.value?.id ?? null,
    phone,
    email,
    name,
    type: obtainType,
    address: obtainType === 'delivery' ? address : null,
    city: obtainType === 'delivery' ? city : null,
    apartment: obtainType === 'delivery' ? apartment || null : null,
    floor: obtainType === 'delivery' ? floor || null : null,
    entrance: obtainType === 'delivery' ? entrance || null : null,
    deliveryDate: obtainType === 'delivery' ? formatDate : null,
    shopAddress: obtainType === 'selfcall' ? shopAddress : null,
    status: 'awaiting',
    price: price.value
  }
  const { data, error } = await createOne('orders', order)
  if (error) {
    loadingCreateOrder.value = 'error'
    toast.error('Произошла ошибка')
    return
  }
  await addOrderedProducts(data.id)
  router.push({ name: 'Cart' })
})
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
          <form-field
            label="Имя*"
            name="name"
          />
        </div>
        <div>
          <form-field
            label="Почта*"
            name="email"
          />
        </div>
        <div>
          <form-field
            label="Телефон*"
            type="tel"
            :show-spin-buttons="false"
            name="phone"
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
            :options="[
              { title: 'Самовызов', value: 'selfcall' },
              { title: 'Доставка', value: 'delivery' }
            ]"
            :model-value="values.obtainType"
            @update:model-value="setFieldValue('obtainType', $event)"
          />
        </div>
        <method-obtain
          :obtain-type="values.obtainType"
          :receipt-details="values.receiptDetails"
          @receipt-details="(field, value) => setFieldValue(field, value)"
        />
      </div>
    </div>
    <div class="block">
      <div class="label">
        <div>3.</div>
        <div>Выберите способ оплаты</div>
      </div>
      <div class="content">
        <v-button type="button">при получении</v-button>
      </div>
    </div>
    <div>
      <div
        class="content"
        style="border-left: unset"
      >
        <div> {{ countCartItems }} {{ getWordByQuantity(countCartItems) }}</div>
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
