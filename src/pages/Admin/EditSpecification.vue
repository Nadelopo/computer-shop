<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCategoriesStore } from '@/stores/categoriesStore'
import { supabase } from '@/db/supabase'
import { useCustomRoute, useCustomRouter } from '@/utils/customRouter'
import SpecificationsForm from '@/components/Admin/Specifications/SpecificationsForm.vue'
import { VButton, VLoader } from '@/components/UI'
import type {
  CategorySpecificationCreate,
  CategorySpecificationRead
} from '@/types/tables/categorySpecifications.types'
import type { Loading } from '@/types'
import type { SpecificationRead } from '@/types/tables/specifications.types'
import type { CategorySpecificationForm } from '@/components/Admin/Specifications/types'

const { categories } = storeToRefs(useCategoriesStore())
const form = ref<CategorySpecificationCreate>()
const route = useCustomRoute('EditSpecification')
const router = useCustomRouter()
const loading = ref<Loading>('loading')
let formInitType: CategorySpecificationRead['type'] = 'string'
onBeforeMount(async () => {
  const { data, error } = await supabase
    .from('category_specifications')
    .select()
    .eq('id', route.params.id)
    .single()
  if (error) {
    loading.value = 'error'
    return
  }

  form.value = data
  formInitType = data.type
  loading.value = 'success'
})

const save = async (values: CategorySpecificationForm) => {
  if (!values?.id || !values.categoryId) return

  loading.value = 'loading'

  const { error } = await supabase
    .from('category_specifications')
    .update({ ...values, categoryId: values.categoryId })
    .eq('id', values.id)

  if (error) return
  if (formInitType !== values.type) {
    let updateValues: Pick<SpecificationRead, 'valueString' | 'valueNumber'> = {
      valueNumber: values.min!,
      valueString: null
    }
    if (values.type !== 'number') {
      updateValues = {
        valueNumber: null,
        valueString: values.variantsValues!
      }
    }

    const { error: errorUpdate } = await supabase
      .from('specifications')
      .update(updateValues)
      .eq('categorySpecificationsId', values.id)
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
        :form-data="form"
        type="update"
        @submit="save"
      />
      <v-button
        class="mt-4"
        @click="router.push({ name: 'AdminSpecifications' })"
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
