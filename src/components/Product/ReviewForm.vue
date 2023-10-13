<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { useUserStore } from '@/stores/userStore'
import { createOne, updateOneById } from '@/utils/queries/db'
import { VButton } from '../UI'
import RatingStars from '../RatingStars.vue'
import type { UpdateProductRating } from '@/pages/Product.vue'
import type {
  ReviewRating,
  ReviewReadWithDetails
} from '@/types/tables/reviews.types'

type ReviewFormCreate = {
  dignities: string
  disadvantages: string
  comment: string
  rating: ReviewRating | 0
}

const props = defineProps<{
  productId: number
  productRating: number
  countReviews: number
}>()

const emit = defineEmits<{
  createReview: [review: ReviewReadWithDetails]
  updateProductRating: [newRating: UpdateProductRating]
}>()

const purifiedForm: ReviewFormCreate = {
  dignities: '',
  disadvantages: '',
  comment: '',
  rating: 0
}

const { user } = storeToRefs(useUserStore())
const toast = useToast()
const showReviewForm = ref(false)

const toggleFormVisibility = () => {
  if (!user.value) {
    toast.warning('Требуется авторизация')
    return
  }
  showReviewForm.value = !showReviewForm.value
}

const form = ref<ReviewFormCreate>({
  ...purifiedForm
})
const route = useRoute()
const createReview = async () => {
  if (!user.value) return
  if (form.value.rating === 0) {
    toast.warning('Укажите оценку')
  } else {
    const { data, error } = await createOne(
      'reviews',
      {
        userId: user.value.id,
        productId: props.productId,
        dignities: form.value.dignities || null,
        disadvantages: form.value.disadvantages || null,
        comment: form.value.comment || null,
        rating: form.value.rating,
        categoryId: Number(route.params.categoryId)
      },
      '*, users(name)'
    )
    if (error) return

    emit('createReview', data)
    form.value = { ...purifiedForm }
    showReviewForm.value = false

    const newProductRating =
      (props.productRating * props.countReviews + data.rating) /
      (props.countReviews + 1)
    const { data: productData, error: errorProduct } = await updateOneById(
      'products',
      props.productId,
      {
        countReviews: props.countReviews + 1,
        rating: newProductRating
      }
    )
    if (errorProduct) return
    emit('updateProductRating', {
      countReviews: productData.countReviews,
      rating: productData.rating
    })
  }
}
</script>

<template>
  <v-button @click="toggleFormVisibility">
    {{ showReviewForm ? 'закрыть' : 'написать отзыв' }}
  </v-button>
  <Transition name="review__form">
    <form
      v-if="showReviewForm"
      class="review__form"
      @submit.prevent="createReview"
    >
      <div class="mb-4">
        <div class="title">Достоинства</div>
        <textarea v-model.trim="form.dignities" />
      </div>
      <div class="mb-4">
        <div class="title">Недостатки</div>
        <textarea v-model.trim="form.disadvantages" />
      </div>
      <div class="mb-4">
        <div class="title">Комментарий</div>
        <textarea v-model.trim="form.comment" />
      </div>
      <div>
        <RatingStars
          v-model="form.rating"
          :static="false"
          class="mb-4 mt-8"
        />
        <v-button>оставить отзыв</v-button>
      </div>
    </form>
  </Transition>
</template>

<style scoped lang="sass">
.review__form
  overflow: hidden
  padding-left: 8px
  margin-top: 30px
  height: 720px
  .title
    margin-bottom: 10px
  textarea
    padding: 10px
    background: #f2f2f2
    width: 90%
    outline: none
    border-radius: 6px
    min-height: 40px
    overflow: auto
    height: 150px
    max-height: 150px
    min-height: 150px
    border: none
    box-shadow: 0 0 5px 0 var(--color-text)
    transition: box-shadow .6s
    font-weight: 300

.review__form-move,
.review__form-enter-active,
.review__form-leave-active
  transition: all 0.5s ease

.review__form-enter-from,
.review__form-leave-to
  opacity: 0
  transition: all 0.5s ease
  height: 0px
  margin-top: 0
</style>
