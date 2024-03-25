<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useCategoriesStore } from '@/stores/categoriesStore'
import { supabase } from '@/db/supabase'
import { getOneById, updateOneById } from '@/db/queries/tables'
import { useCustomRouter } from '@/utils/useCustomRouter'
import SpecificationsForm from '@/components/Admin/Specifications/SpecificationsForm.vue'
import { VButton, VLoader } from '@/components/UI'
import type {
  CategorySpecificationCreate,
  CategorySpecificationRead
} from '@/types/tables/categorySpecifications.types'
import type { Loading } from '@/types'
import type { SpecificationRead } from '@/types/tables/specifications.types'

const { categories } = storeToRefs(useCategoriesStore())
const form = ref<CategorySpecificationCreate>()
const route = useRoute()
const router = useCustomRouter()
const loading = ref<Loading>('loading')
let formInitType: CategorySpecificationRead['type'] = 'string'
onBeforeMount(async () => {
  const { data, error } = await getOneById(
    'category_specifications',
    Number(route.params.id)
  )
  if (error) {
    loading.value = 'error'
    return
  }
  form.value = data
  formInitType = data.type
  loading.value = 'success'
})

const save = async () => {
  if (!form.value?.id) return
  loading.value = 'loading'
  const { error } = await updateOneById(
    'category_specifications',
    form.value.id,
    form.value
  )
  if (error) return
  if (formInitType !== form.value.type) {
    let updateValues: Pick<SpecificationRead, 'valueString' | 'valueNumber'> = {
      valueNumber: form.value.min!,
      valueString: null
    }
    if (form.value.type !== 'number') {
      updateValues = {
        valueNumber: null,
        valueString: form.value.variantsValues!
      }
    }

    const { error: errorUpdate } = await supabase
      .from('specifications')
      .update(updateValues)
      .eq('categorySpecificationsId', form.value.id)
    if (errorUpdate) {
      console.error(errorUpdate)
    }
  }
  router.push({ name: 'AdminSpecifications' })
}
</script>

<template>
  <div class="container">
    <div
      v-if="loading === 'success' && categories.length"
      class="py-10"
    >
      <specifications-form
        v-if="form"
        v-model="form"
        type="update"
        @submit="save"
      />
      <v-button
        class="mt-4"
        @click="$router.push({ name: 'AdminSpecifications' })"
      >
        назад
      </v-button>
    </div>
    <v-loader
      v-else
      class="h-[75vh]"
    />
  </div>
</template>
