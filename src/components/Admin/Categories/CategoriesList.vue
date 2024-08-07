<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCategoriesStore } from '@/stores/categoriesStore'
import { VTable, VConfirm } from '@/components/UI'
import { removeFromStorage } from '@/db/queries/storage'
import { deleteOneById } from '@/db/queries/tables'
import AppLink from '@/components/AppLink.vue'
import ActionIcon from '@/components/ActionIcon.vue'
import { EditSvg, TrashSvg } from '@/assets/icons'
import type { Loading } from '@/types'

const { categories } = storeToRefs(useCategoriesStore())

const loadingRemove = ref<Loading>('success')
const currentRemoveCategoryId = ref(0)
const remove = async (id: number, img: string) => {
  currentRemoveCategoryId.value = id
  loadingRemove.value = 'loading'
  const { data, error } = await deleteOneById('categories', id)
  if (error) {
    loadingRemove.value = 'error'
    return
  }
  categories.value = categories.value.filter((e) => e.id !== data.id)
  const { data: imageData } = await removeFromStorage('categories', img)
  if (!imageData?.length) {
    loadingRemove.value = 'error'
    return
  }
  loadingRemove.value = 'success'
}
</script>

<template>
  <v-table
    class="mt-6"
    line
  >
    <template #header>Категории</template>
    <thead>
      <tr>
        <th>Наименование</th>
        <th>Наименование на английском</th>
        <th>Изображение</th>
        <th class="w-1">Действия</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="category in categories"
        :key="category.id"
      >
        <td>{{ category.title }}</td>
        <td>{{ category.enTitle }}</td>
        <td>
          <img
            class="max-w-[120px]"
            :src="category.img"
            alt=""
          />
        </td>
        <td>
          <div class="flex">
            <app-link
              :to="{
                name: 'EditCategory',
                params: {
                  category: category.title,
                  id: category.id
                }
              }"
            >
              <action-icon
                :svg="EditSvg"
                paint-type="stroke"
              />
            </app-link>
            <v-confirm
              v-slot="{ openModal }"
              :message="`Вы точно хотите удалить категорю - ${category.title}`"
              @ok="remove(category.id, category.img)"
            >
              <action-icon
                :svg="TrashSvg"
                variant="danger"
                :loading="
                  loadingRemove === 'loading' &&
                  currentRemoveCategoryId === category.id
                "
                @click="openModal"
              />
            </v-confirm>
          </div>
        </td>
      </tr>
    </tbody>
  </v-table>
</template>
