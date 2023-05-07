<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import Swal from 'sweetalert2'
import { createOne, getAllByColumns } from '@/utils/queries/db'
import { useUserStore } from '@/stores/userStore'
import RatingStars from '../RatingStars.vue'
import VButton from '@/components/UI/VButton.vue'
import AvatarSvg from '@/assets/icons/avatar.svg?component'
import type { ReviewCreateRating, ReviewRead } from '@/types/tables/reviews'
// import { useRoute } from 'vue-router'

type ReviewFormCreate = {
  dignities: string
  disadvantages: string
  comment: string
  rating: ReviewCreateRating | 0
}

const props = defineProps<{
  productId: number
}>()

const { user } = storeToRefs(useUserStore())

const reviews = ref<ReviewRead[]>([])
const showReviewForm = ref(false)

const loadReviews = async () => {
  const data = await getAllByColumns<ReviewRead>('reviews', [
    {
      column: 'productId',
      value: props.productId
    }
  ])
  if (data) {
    reviews.value = data
  }
}
loadReviews()

const copyForm: ReviewFormCreate = {
  dignities: '',
  disadvantages: '',
  comment: '',
  rating: 0
}

const form = ref<ReviewFormCreate>({
  ...copyForm
})

const createReview = async () => {
  if (!user.value) {
    Swal.fire(
      '',
      'Только авторизованные пользователи могут оставлять отзывы.',
      'warning'
    )
  } else if (form.value.rating === 0) {
    Swal.fire('', 'Укажите оценку', 'warning')
  } else {
    const data = await createOne<ReviewRead>('reviews', {
      userId: user.value.id,
      productId: props.productId,
      dignities: form.value.dignities || null,
      disadvantages: form.value.disadvantages || null,
      comment: form.value.comment || null,
      rating: form.value.rating,
      name: user.value.name
    })
    if (data) {
      reviews.value.unshift(data)
      form.value = { ...copyForm }
      showReviewForm.value = false
    }
  }
}

watch(() => props.productId, loadReviews)
</script>

<template>
  <div class="wrapper grid">
    <div>Отзывы</div>
    <div>
      <v-button class="ml-2" @click="showReviewForm = !showReviewForm">
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
      <div class="reviews">
        <div v-for="review in reviews" :key="review.id" class="review">
          <div class="flex gap-x-6">
            <AvatarSvg width="40" fill="#cdcdcd" />
            <div class="flex items-center">{{ review.name }}</div>
            <div class="flex gap-x-2 items-center">
              <RatingStars :model-value="review.rating" />
              <span>{{ review.rating }}</span>
            </div>
            <div class="ml-auto">
              {{ new Date(review.created_at).toLocaleDateString() }}
            </div>
          </div>
          <div v-if="review.dignities" class="mb-4 mt-6">
            <div class="title">Достоинства</div>
            <div>{{ review.dignities }}</div>
          </div>
          <div v-if="review.disadvantages" class="mb-4">
            <div class="title">Недостатки</div>
            <div>{{ review.disadvantages }}</div>
          </div>
          <div v-if="review.comment" class="mb-4">
            <div class="title">Комментарий</div>
            <div>{{ review.comment }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="sass">
.review__form
  overflow: hidden
  padding-left: 8px
  margin-top: 30px
  height: 750px
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

.title
  font-size: 20px
  font-weight: 500
  margin-bottom: 10px

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

.reviews
  margin-top: 50px
  .review
    background: #f6f6f6
    border-radius: 8px
    padding: 8px 16px
    margin-bottom: 50px
</style>
