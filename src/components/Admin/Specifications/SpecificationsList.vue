<script setup lang="ts">
import { computed, onBeforeMount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { deleteOneById, getAll } from '@/db/queries/tables'
import { VTabs, VTable, VLoader, VConfirm } from '@/components/UI'
import ActionIcon from '@/components/ActionIcon.vue'
import { EditSvg, TrashSvg } from '@/assets/icons'
import type { Loading } from '@/types'
import type { CategorySpecificationRead } from '@/types/tables/categorySpecifications.types'

type Category = {
  enTitle: string
  id: number
  title: string
}

const specifications = defineModel<CategorySpecificationRead[]>({
  required: true
})

const route = useRoute()
const currentCategoryId = ref<number | null>(
  route.query.specificationId ? Number(route.query.specificationId) : null
)
const categories = ref<Category[]>([])
const categorySpecifications = computed(() => {
  return specifications.value.filter(
    (e) => e.categoryId === currentCategoryId.value
  )
})

const loadingGetCategories = ref<Loading>('loading')
onBeforeMount(async () => {
  const { data: categoriesData, error: categoriesError } = await getAll(
    'categories',
    {
      select: 'enTitle, id, title'
    }
  )
  if (categoriesError) {
    loadingGetCategories.value = 'error'
    return
  }
  categories.value = categoriesData
  currentCategoryId.value = currentCategoryId.value ?? categoriesData[0].id
  loadingGetCategories.value = 'success'
})

const currentRemoveSpecificationId = ref(0)
const loadingRemoveData = ref<Loading>('success')
const remove = async (id: number) => {
  currentRemoveSpecificationId.value = id
  loadingRemoveData.value = 'loading'
  const { error } = await deleteOneById('category_specifications', id)
  if (error) {
    loadingRemoveData.value = 'error'
    return
  }
  specifications.value = specifications.value.filter((e) => e.id !== id)
  loadingRemoveData.value = 'success'
}

const loadingGetSpecifications = ref<Loading>('success')
watch(
  currentCategoryId,
  async () => {
    const findedSpecifications = specifications.value.find(
      (e) => e.categoryId === currentCategoryId.value
    )
    loadingGetSpecifications.value = 'loading'
    if (!currentCategoryId.value || findedSpecifications) {
      loadingGetSpecifications.value = 'success'
      return
    }
    const { data, error } = await getAll('category_specifications', {
      match: {
        categoryId: currentCategoryId.value
      }
    })
    if (error) return
    if (!data.length) {
      loadingGetSpecifications.value = 'empty'
      return
    }
    specifications.value.push(...data)
    loadingGetSpecifications.value = 'success'
  },
  {
    immediate: true
  }
)
</script>

<template>
  <div class="mt-8">
    <div v-if="loadingGetCategories === 'success'">
      <v-tabs
        v-model="currentCategoryId"
        :options="
          categories.map((e) => ({
            title: e.title,
            value: e.id
          }))
        "
        query-param-name="specificationId"
      />
      <v-table
        placement="center"
        line
      >
        <template #header>Характеристики категории </template>
        <div
          v-if="loadingGetSpecifications === 'loading'"
          class="py-4"
        >
          <v-loader />
        </div>
        <div
          v-else-if="loadingGetSpecifications === 'empty'"
          class="text-2xl font-medium py-6"
        >
          Характеристики отсутствуют
        </div>
        <template v-else-if="loadingGetSpecifications === 'success'">
          <thead>
            <tr>
              <th style="min-width: 200px">Наименование</th>
              <th>Наименование на англйском</th>
              <th>Тип<span class="text-sm">(число/строка)</span></th>
              <th>Отображение на карточке товара</th>
              <th>Единицы измерения</th>
              <th>
                Минимальное значение<span class="text-sm"> (число)</span>
              </th>
              <th>
                Максимальное значение<span class="text-sm"> (число)</span>
              </th>
              <th>Шаг изменения<span class="text-sm"> (число)</span></th>
              <th>
                Условие лучшего значения<span class="text-sm"> (число) </span>
              </th>
              <th> Варианты значений<span class="text-sm"> (строка)</span> </th>
              <th>действия</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="specification in categorySpecifications"
              :key="specification.id"
            >
              <td>{{ specification.title }}</td>
              <td>{{ specification.enTitle }}</td>
              <td>{{ specification.type ? 'число' : 'строка' }}</td>
              <td>{{ specification.visible ? 'да' : 'нет' }}</td>
              <td>{{ specification.units || '-' }}</td>
              <td>{{ specification.min ?? '-' }}</td>
              <td>{{ specification.max ?? '-' }}</td>
              <td>{{ specification.step ?? '-' }}</td>
              <td>
                {{
                  specification.condition === 'greater'
                    ? 'больше'
                    : specification.condition === 'less'
                      ? 'меньше'
                      : '-'
                }}
              </td>
              <td>
                <div class="variant__values">
                  <span
                    v-for="value in specification.variantsValues"
                    :key="value"
                  >
                    {{ value }}
                  </span>
                </div>
                <span v-if="!specification.variantsValues?.length"> - </span>
              </td>
              <td>
                <div class="flex">
                  <action-icon
                    tag="a"
                    :to="{
                      name: 'EditSpecification',
                      params: {
                        categoryId: specification.categoryId,
                        id: specification.id
                      }
                    }"
                    :svg="EditSvg"
                    paint-type="stroke"
                  />
                  <v-confirm
                    v-slot="{ openModal }"
                    :message="`Вы точно хотите удалитть характеристику - ${
                      specification.title
                    }`"
                    @ok="remove(specification.id)"
                  >
                    <action-icon
                      :svg="TrashSvg"
                      variant="danger"
                      :loading="
                        loadingRemoveData === 'loading' &&
                        currentRemoveSpecificationId === specification.id
                      "
                      @click="openModal"
                    />
                  </v-confirm>
                </div>
              </td>
            </tr>
          </tbody>
        </template>
      </v-table>
    </div>
    <v-loader v-else-if="loadingGetCategories === 'loading'" />
    <div v-else-if="loadingGetCategories === 'error'"> Произошла ошибка </div>
  </div>
</template>

<style scoped>
.variant__values {
  display: grid;
  grid-template-columns: repeat(3, auto);
  gap: 8px;
}
</style>
