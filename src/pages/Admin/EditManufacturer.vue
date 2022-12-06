<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { getOneWithId } from '@/utils/dbQueries'
import VInputText from '@/components/UI/VInputText.vue'
import VInputFileVue from '@/components/UI/VInputFile.vue'
import VButton from '@/components/UI/VButton.vue'
import type { ImanufacturerR } from '@/types/tables'

const manufactuerId = useRoute().params.id

const { data } = await getOneWithId<ImanufacturerR>(
  'manufacturers',
  String(manufactuerId)
)

const manufacturer = ref(data)
</script>

<template>
  <div>
    <div class="container">
      <div v-if="manufacturer" class="list__form pt-10">
        <div>
          <label>наименование</label>
          <v-input-text v-model="manufacturer.title" />
        </div>
        <div>
          <label>описание</label>
          <div>
            <textarea v-model="manufacturer.description" />
          </div>
        </div>
        <div>
          <label>изображение</label>
          <div>
            <v-input-fileVue v-model="manufacturer.img" />
          </div>
        </div>
        <div>
          <v-button
            @click="
              $router.push({
                name: 'AdminCreateProducts',
                params: { link: 'manufacturers' },
              })
            "
          >
            сохранить
          </v-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="sass">
textarea
  width: 100%
  min-height: 50px
</style>
