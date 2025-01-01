<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'vue-toastification'
import { supabase } from '@/db/supabase'
import { useCustomRoute } from '@/utils/customRouter'
import { getOrFilterForSearch } from '@/utils/getOrFilterForSearch'
import { VButton, VConfirm, VInputText, VLoader, VTable } from '@/components/UI'
import { EditSvg, TrashSvg } from '@/assets/icons'
import ActionIcon from '@/components/ActionIcon.vue'
import type { Loading } from '@/types'
import type { ProductRead } from '@/types/tables/products.types'
import type { ProductQuantityInStoreRead } from '@/types/tables/ProductQuantityInStores'

export type ProductDetails = ProductQuantityInStoreRead & {
  products: Pick<ProductRead, 'title'>
  oldQuantity: number
}

const route = useCustomRoute('AdminShopDetails')
const shopId = Number(route.params.id)

const productsInShops = ref<ProductDetails[]>([])
const search = ref('')
const loading = ref<Loading>('loading')
const loadProductsInShops = async () => {
  loading.value = 'loading'

  const { data, error } = await supabase
    .from('product_quantity_in_stores')
    .select('*, products(title)')
    .eq('shopId', shopId)
    .or(getOrFilterForSearch(search.value, 'products.title'), {
      referencedTable: 'products'
    })
  if (error) {
    loading.value = 'error'
    return
  }

  if (data.length === 0) {
    useToast().warning('Товары не найдены')
    loading.value = 'empty'
    return
  }

  productsInShops.value = data.map((e) => {
    return {
      ...e,
      oldQuantity: e.quantity
    }
  })
  loading.value = 'success'
}
loadProductsInShops()

defineExpose({ loadProductsInShops })

const currentRemoveShopId = ref(0)
const loadingRemove = ref<Loading>('loading')
const remove = async (id: number) => {
  const { error } = await supabase
    .from('product_quantity_in_stores')
    .delete()
    .eq('id', id)
  if (error) return

  productsInShops.value = productsInShops.value.filter((e) => e.id !== id)
}

const currentEditIds = ref<number[]>([])
const edit = (currentId: number) => {
  if (currentEditIds.value.includes(currentId)) {
    currentEditIds.value = currentEditIds.value.filter((id) => id !== currentId)
    return
  }
  currentEditIds.value.push(currentId)
}

const save = async () => {
  const changedValues: ProductQuantityInStoreRead[] = productsInShops.value
    .filter((e) => currentEditIds.value.includes(e.id))
    .map((e) => ({
      id: e.id,
      created_at: e.created_at,
      productId: e.productId,
      quantity: e.quantity,
      shopId: e.shopId
    }))

  await supabase.from('product_quantity_in_stores').upsert(changedValues, {
    onConflict: 'id'
  })

  currentEditIds.value = []
  productsInShops.value = productsInShops.value.map((e) => {
    return { ...e, oldQuantity: e.quantity }
  })
  useToast().success('Изменения сохранены')
}
</script>

<template>
  <v-input-text
    v-model="search"
    placeholder="#id или название товара"
    @keyup.enter="loadProductsInShops"
    @search="loadProductsInShops"
    @clear=";(search = ''), loadProductsInShops()"
  />
  <v-table>
    <template #header> Товары в магазине </template>
    <template v-if="loading === 'success'">
      <thead>
        <tr>
          <th>Название</th>
          <th>Количество</th>
          <th width="1%">Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="productInShop in productsInShops"
          :key="productInShop.id"
        >
          <td>{{ productInShop.products.title }}</td>
          <td width="30%">
            <div v-if="currentEditIds.includes(productInShop.id)">
              <v-input-text
                v-model="productInShop.quantity"
                type="number"
                min="0"
                autofocus
              />
            </div>
            <div v-else>
              {{ productInShop.oldQuantity }}
            </div>
          </td>
          <td>
            <div class="flex">
              <action-icon
                :svg="EditSvg"
                paint-type="stroke"
                @click="edit(productInShop.id)"
              />
              <v-confirm
                v-slot="{ openModal }"
                :message="'Вы точно хотите удалить?'"
                @ok="remove(productInShop.id)"
              >
                <action-icon
                  :svg="TrashSvg"
                  variant="danger"
                  :loading="
                    loadingRemove === 'loading' &&
                    currentRemoveShopId === productInShop.id
                  "
                  @click="openModal"
                />
              </v-confirm>
            </div>
          </td>
        </tr>
      </tbody>
    </template>
    <div
      v-else-if="loading === 'loading'"
      class="p-4"
    >
      <v-loader />
    </div>
    <div
      v-else-if="loading === 'empty'"
      class="p-4"
    >
      Товары отсутствуют
    </div>
  </v-table>
  <div>
    <v-button
      v-if="currentEditIds.length"
      @click="save"
    >
      Сохранить
    </v-button>
  </div>
</template>

<style scoped lang="sass"></style>
