<script setup lang="ts">
import { ref } from 'vue'
import { removeFromStorage, type StorageError } from '@/db/queries/storage'
import { deleteOneById } from '@/db/queries/tables'
import { getSpecificationValue } from '@/utils/getSpecificationValue'
import { formatPrice } from '@/utils/formatPrice'
import { VLoader, VConfirm, VTable, VInputText } from '@/components/UI'
import ActionIcon from '@/components/ActionIcon.vue'
import { EditSvg, TrashSvg } from '@/assets/icons'
import type { CategorySpecificationRead } from '@/types/tables/categorySpecifications.types'
import type { ProductWithSpecifications } from '@/types/tables/products.types'
import type { Loading } from '@/types'

const props = defineProps<{
  specifications: CategorySpecificationRead[]
  loading: Loading
  products: ProductWithSpecifications[]
}>()

const emit = defineEmits<{
  'update:products': [ProductWithSpecifications[]]
}>()

const search = defineModel<string>('search', { required: true })

const loadingRemove = ref<Loading>('success')
const currentRemoveProductId = ref(0)
const remove = async (id: number, img: string[]) => {
  loadingRemove.value = 'loading'
  currentRemoveProductId.value = id
  const { data, error } = await deleteOneById('products', id)
  if (error) return

  emit(
    'update:products',
    props.products.filter((e) => e.id !== data.id)
  )
  const deleteImages: Promise<{ error: null | StorageError }>[] = []
  img.forEach((url) => {
    deleteImages.push(removeFromStorage('products', url))
  })
  const errorDelete = (await Promise.all(deleteImages)).some((e) => e === null)

  if (errorDelete) {
    loadingRemove.value = 'error'
  }
  loadingRemove.value = 'success'
}
</script>

<template>
  <div
    v-if="loading !== 'loading'"
    class="py-4"
  >
    <v-input-text
      v-model="search"
      :debounce="1000"
      placeholder="введите название товара или id"
    />
  </div>
  <v-table
    v-if="loading === 'success'"
    placement="center"
    line
  >
    <thead>
      <tr>
        <th class="min-w-[200px]">Наименование</th>
        <th
          v-for="specification in specifications"
          :key="specification.id"
        >
          {{ specification.title }}
        </th>
        <th>Цена</th>
        <th>Цена со скидкой</th>
        <th>Скидка</th>
        <th>Производитель</th>
        <th>Гарантия</th>
        <th>Изображение</th>
        <th>Действия</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="product in products"
        :key="product.id"
      >
        <td>{{ product.title }}</td>
        <td
          v-for="specification in product.specifications"
          :key="specification.id"
        >
          {{ getSpecificationValue(specification) }}
          {{ specification.category_specifications.units }}
        </td>
        <td class="min-w-[100px]">
          {{ formatPrice(product.priceWithoutDiscount) }}
        </td>
        <td>{{ formatPrice(product.price) }}</td>
        <td>{{ product.discount }} %</td>
        <td>{{ product.manufacturers.title }} </td>
        <td>{{ product.warranty }} мес</td>
        <td>
          <img
            :src="product.img[0]"
            class="max-w-[120px]"
            alt=""
          />
        </td>
        <td>
          <div class="flex">
            <action-icon
              tag="a"
              :to="{
                name: 'EditProducts',
                params: {
                  category: product.categories.enTitle,
                  categoryId: product.categoryId,
                  id: product.id
                }
              }"
              :svg="EditSvg"
              paint-type="stroke"
            />
            <v-confirm
              v-slot="{ openModal }"
              :message="`Вы точно хотите удалить продукт - ${product.title}`"
              @ok="remove(product.id, product.img)"
            >
              <action-icon
                :svg="TrashSvg"
                variant="danger"
                :loading="
                  loadingRemove === 'loading' &&
                  currentRemoveProductId === product.id
                "
                @click="openModal"
              />
            </v-confirm>
          </div>
        </td>
      </tr>
    </tbody>
  </v-table>
  <div
    v-else-if="loading === 'empty'"
    class="text-2xl text-center font-normal mt-16"
  >
    товары отсутствуют
  </div>
  <div
    v-else-if="loading === 'loading'"
    class="h-[20vh] flex items-center"
  >
    <v-loader />
  </div>
</template>
