<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { useUserStore } from '@/stores/userStore'
import { createOne, getAll, updateOneById } from '@/db/queries/tables'
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

const props = defineProps<{ productId: number }>()

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

const toggleForm = () => {
  if (!user.value) {
    toast.warning('Требуется авторизация')
    return
  }
  showReviewForm.value = !showReviewForm.value
}

const form = ref<ReviewFormCreate>({
  ...purifiedForm
})
const createReview = async () => {
  if (!user.value) return
  if (form.value.rating === 0) {
    toast.warning('Укажите оценку')
  } else {
    const { data: createdReview, error } = await createOne(
      'reviews',
      {
        userId: user.value.id,
        productId: props.productId,
        dignities: form.value.dignities || null,
        disadvantages: form.value.disadvantages || null,
        comment: form.value.comment || null,
        rating: form.value.rating
      },
      '*, users(name)'
    )
    if (error) return

    emit('createReview', createdReview)
    form.value = { ...purifiedForm }
    showReviewForm.value = false

    const { data: reviewsRating } = await getAll('reviews', {
      match: { productId: props.productId },
      select: 'rating'
    })
    if (!reviewsRating) return

    const newProductRating =
      reviewsRating.reduce((a, b) => a + b.rating, 0) / reviewsRating.length
    const { data: productUpdated, error: errorProduct } = await updateOneById(
      'products',
      props.productId,
      { rating: newProductRating, countReviews: reviewsRating.length }
    )
    if (errorProduct) return
    emit('updateProductRating', { rating: productUpdated.rating })
  }
}
</script>

<template>
  <v-button @click="toggleForm">
    {{ showReviewForm ? 'закрыть' : 'написать отзыв' }}
  </v-button>
  <Transition name="review__form">
    <form
      v-if="showReviewForm"
      class="review__form"
      @submit.prevent="createReview"
    >
      <div class="mb-4">
        <label
          for="dignities"
          class="title"
        >
          Достоинства
        </label>
        <textarea
          id="dignities"
          v-model.trim="form.dignities"
        />
      </div>
      <div class="mb-4">
        <label
          for="disadvantages"
          class="title"
        >
          Недостатки
        </label>
        <textarea
          id="disadvantages"
          v-model.trim="form.disadvantages"
        />
      </div>
      <div class="mb-4">
        <label
          for="comment"
          class="title"
        >
          Комментарий
        </label>
        <textarea
          id="comment"
          v-model.trim="form.comment"
        />
      </div>
      <div>
        <rating-stars
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
    display: block
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
    box-shadow: 0 0 5px 0 var(--main-semi-light)
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
