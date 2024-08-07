<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { storeToRefs } from 'pinia'
import { useCustomRoute } from '@/utils/customRouter'
import { useManufacturersStore } from '@/stores/manufacturersStore'
import {
  VInputText,
  VTextarea,
  VInputFile,
  VButtons,
  VSelect,
  VButton,
  VLoader
} from '@/components/UI'
import type { ProductCreate } from '@/types/tables/products.types'
import type { Loading } from '@/types'
import type { SpecificationCreateForm } from './types'
import type { InputFileActions } from '@/components/UI/VInputFile/types'

defineProps<{
  loadingData: Loading
  loadingSubmit?: Loading
  type: 'create' | 'update'
}>()
const product = defineModel<ProductCreate>({ required: true })
const productSpecifications = defineModel<SpecificationCreateForm[]>(
  'specifications',
  {
    required: true
  }
)
const emit = defineEmits<{
  submit: [fileActions: InputFileActions<string[]> | undefined]
}>()

const route = useCustomRoute('AdminProducts')
watchEffect(() => {
  const categoryId = route.params.id
  if (!categoryId) return
  product.value.categoryId = Number(categoryId)
})

const { manufacturers } = storeToRefs(useManufacturersStore())
const inputFileRef = ref<InputFileActions<string[]>>()
const onSubmit = () => {
  emit('submit', inputFileRef.value)
}
</script>

<template>
  <form
    v-if="loadingData === 'success'"
    class="list__form mb-8"
    @submit.prevent="onSubmit"
  >
    <div>
      <label for="title">Наименование</label>
      <v-input-text
        id="title"
        v-model="product.title"
      />
    </div>
    <div>
      <label for="description">Описание</label>
      <v-textarea
        id="description"
        v-model="product.description"
        auto-grow
      />
    </div>
    <div>
      <label for="img">Изображение</label>
      <v-input-file
        id="img"
        ref="inputFileRef"
        folder="products"
        :file-url="product.img"
      />
    </div>
    <div
      v-for="specification in productSpecifications"
      :key="specification.id"
    >
      <label :for="specification.title">{{ specification.title }}</label>
      <v-input-text
        v-if="specification.type === 'number'"
        :id="specification.title"
        v-model="specification.valueNumber"
        type="number"
        :max="specification.max"
        :min="specification.min"
        :step="specification.step"
      />
      <v-select
        v-else-if="specification.type === 'string'"
        v-model="specification.valueString[0]"
        :options="
          specification.variantsValues.map((v) => ({
            title: v,
            value: v
          }))
        "
        class="mt-2"
      />
      <v-buttons
        v-else
        v-model="specification.valueString"
        class="mt-2"
        :options="
          specification.variantsValues.map((v) => ({ title: v, value: v }))
        "
      />
    </div>

    <div>
      <label for="manufacturer">производитель</label>
      <div>
        <v-select
          id="manufacturer"
          v-model="product.manufacturerId"
          :options="manufacturers.map((e) => ({ value: e.id, title: e.title }))"
          class="mt-4"
        />
      </div>
    </div>
    <div>
      <label for="warranty">гарантия</label>
      <v-input-text
        id="warranty"
        v-model="product.warranty"
        type="number"
      />
    </div>
    <div v-if="type === 'update' && product.sell !== undefined">
      <div>продажи</div>
      <v-buttons
        v-model="product.sell"
        class="mt-2"
        :options="[
          { title: 'продавать', value: true },
          { title: 'остановить продажи', value: false }
        ]"
      />
    </div>
    <div>
      <label for="price">цена</label>
      <v-input-text
        id="price"
        v-model="product.priceWithoutDiscount"
        type="number"
      />
    </div>
    <div v-if="product.discount !== undefined">
      <label for="discount">скидка %</label>
      <v-input-text
        id="discount"
        v-model="product.discount"
        type="number"
      />
    </div>

    <div>
      <v-button
        type="submit"
        :loading="loadingSubmit === 'loading'"
      >
        {{ type === 'create' ? 'создать' : 'сохранить' }}
      </v-button>
    </div>
  </form>
  <div
    v-else-if="loadingData === 'loading'"
    class="h-[50vh] flex items-center"
  >
    <v-loader />
  </div>
  <div
    v-else-if="loadingData === 'empty'"
    class="text-2xl text-center font-normal mt-16"
  >
    Характеристики категории отсутствуют
  </div>
</template>
