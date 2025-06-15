<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { storeToRefs } from 'pinia'
import { useCustomRoute } from '@/shared/composables/customRouter'
import { useManufacturersStore } from '@/modules/manufacturers'
import {
  VInputText,
  VTextarea,
  VInputFile,
  VButtons,
  VSelect,
  VButton,
  VLoader
} from '@/components/UI'
import type { Loading } from '@/types'
import type { SpecificationCreateForm, ProductCreate } from '../types/products.types'
import type { InputFileActions } from '@/components/UI/VInputFile/types'

defineProps<{
  loadingData: Loading
  loadingSubmit?: Loading
  type: 'create' | 'update'
}>()
const product = defineModel<ProductCreate>({ required: true })
const productSpecifications = defineModel<SpecificationCreateForm[]>('specifications', {
  required: true
})
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
      <VInputText
        id="title"
        v-model="product.title"
      />
    </div>
    <div>
      <label for="description">Описание</label>
      <VTextarea
        id="description"
        v-model="product.description"
        auto-grow
      />
    </div>
    <div>
      <label for="img">Изображение</label>
      <VInputFile
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
      <VInputText
        v-if="specification.type === 'number'"
        :id="specification.title"
        v-model="specification.valueNumber"
        type="number"
        :max="specification.max"
        :min="specification.min"
        :step="specification.step"
      />
      <VSelect
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
      <VButtons
        v-else
        v-model="specification.valueString"
        class="mt-2"
        :options="specification.variantsValues.map((v) => ({ title: v, value: v }))"
      />
    </div>

    <div>
      <label for="manufacturer">производитель</label>
      <div>
        <VSelect
          id="manufacturer"
          v-model="product.manufacturerId"
          :options="manufacturers.map((e) => ({ value: e.id, title: e.title }))"
          class="mt-4"
        />
      </div>
    </div>
    <div>
      <label for="warranty">гарантия</label>
      <VInputText
        id="warranty"
        v-model="product.warranty"
        type="number"
      />
    </div>
    <div v-if="type === 'update' && product.sell !== undefined">
      <div>продажи</div>
      <VButtons
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
      <VInputText
        id="price"
        v-model="product.priceWithoutDiscount"
        type="number"
      />
    </div>
    <div v-if="product.discount !== undefined">
      <label for="discount">скидка %</label>
      <VInputText
        id="discount"
        v-model="product.discount"
        type="number"
      />
    </div>

    <div>
      <VButton
        type="submit"
        :loading="loadingSubmit === 'loading'"
      >
        {{ type === 'create' ? 'создать' : 'сохранить' }}
      </VButton>
    </div>
  </form>
  <div
    v-else-if="loadingData === 'loading'"
    class="h-[50vh] flex items-center"
  >
    <VLoader />
  </div>
  <div
    v-else-if="loadingData === 'empty'"
    class="text-2xl text-center font-normal mt-16"
  >
    Характеристики категории отсутствуют
  </div>
</template>
