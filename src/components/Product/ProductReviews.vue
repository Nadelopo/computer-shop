<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import Swal from 'sweetalert2'
import { createOne, getAllByColumns, updateOne } from '@/utils/queries/db'
import { useUserStore } from '@/stores/userStore'
import RatingStars from '../RatingStars.vue'
import VButton from '@/components/UI/VButton.vue'
import AvatarSvg from '@/assets/icons/avatar.svg?component'
import ArrowSVG from '@/assets/icons/arrow.svg?component'
import type {
  ReviewCreateRating,
  ReviewReadWithDetails,
  UsersRated
} from '@/types/tables/reviews'
import type { UpdateProductRating } from '@/pages/Product.vue'

// import { useRoute } from 'vue-router'

type ReviewFormCreate = {
  dignities: string
  disadvantages: string
  comment: string
  rating: ReviewCreateRating | 0
}

const props = defineProps<{
  productId: number
  countReviews: number
  productRating: number
}>()

const emit = defineEmits<{
  (e: 'updateProductRating', data: UpdateProductRating): void
}>()

const { user } = storeToRefs(useUserStore())

const reviews = ref<ReviewReadWithDetails[]>([])
const showReviewForm = ref(false)

const loadReviews = async () => {
  const data = await getAllByColumns<'reviews', ReviewReadWithDetails>(
    'reviews',
    [
      {
        column: 'productId',
        value: props.productId
      }
    ],
    {
      select: '*, users(name)'
    }
  )

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
    const data = await createOne<'reviews', ReviewReadWithDetails>(
      'reviews',
      {
        userId: user.value.id,
        productId: props.productId,
        dignities: form.value.dignities || null,
        disadvantages: form.value.disadvantages || null,
        comment: form.value.comment || null,
        rating: form.value.rating
      },
      {
        select: '*, users(name)'
      }
    )
    console.log(data)
    if (data) {
      reviews.value.unshift(data)
      form.value = { ...copyForm }
      showReviewForm.value = false

      const newProductRating =
        (props.productRating * props.countReviews + data.rating) /
        (props.countReviews + 1)
      const productData = await updateOne('products', props.productId, {
        countReviews: props.countReviews + 1,
        rating: newProductRating
      })
      if (productData) {
        emit('updateProductRating', {
          countReviews: productData.countReviews,
          rating: productData.rating
        })
      }
    }
  }
}

const userAlreadyRated = (review: ReviewReadWithDetails): boolean | null => {
  for (const rated of review.usersRated) {
    if (rated.userId === user.value?.id) {
      return rated.evaluation
    }
  }
  return null
}

const evaluationReview = async (
  review: ReviewReadWithDetails,
  evaluation: boolean
) => {
  if (!user.value) {
    Swal.fire(
      '',
      'Только авторизованные пользователи могут ставить оценки',
      'warning'
    )
    return
  }
  const value = evaluation ? 'likes' : 'dislikes'

  let newUsersRated: UsersRated[] = review.usersRated
  let quantity: { likes?: number; dislikes?: number } = {}

  if (userAlreadyRated(review) === null) {
    newUsersRated.push({
      userId: user.value.id,
      evaluation
    })
    quantity = {
      [value]: review[value] + 1
    }
  } else {
    if (userAlreadyRated(review) === true && value === 'likes') {
      newUsersRated = newUsersRated.filter((e) => e.userId !== user.value?.id)
      quantity = {
        likes: review.likes - 1
      }
    }
    if (userAlreadyRated(review) === true && value === 'dislikes') {
      quantity = {
        likes: review.likes - 1,
        dislikes: review.dislikes + 1
      }
      newUsersRated = newUsersRated.map((e) =>
        e.userId === user.value?.id ? { ...e, evaluation: false } : e
      )
    }
    if (userAlreadyRated(review) === false && value === 'likes') {
      quantity = {
        likes: review.likes + 1,
        dislikes: review.dislikes - 1
      }
      newUsersRated = newUsersRated.map((e) =>
        e.userId === user.value?.id ? { ...e, evaluation: true } : e
      )
    }
    if (userAlreadyRated(review) === false && value === 'dislikes') {
      newUsersRated = newUsersRated.filter((e) => e.userId !== user.value?.id)

      quantity = {
        dislikes: review.dislikes - 1
      }
    }
  }

  const newValues = {
    ...quantity,
    usersRated: newUsersRated
  }

  const data = await updateOne('reviews', review.id, newValues)
  if (data) {
    reviews.value = reviews.value.map((e) =>
      review.id === e.id ? { ...e, ...newValues } : e
    )
  }
}

const ratingBtns = (review: ReviewReadWithDetails) => {
  return [
    {
      type: true,
      action: 'like',
      value: review.likes
    },
    {
      type: false,
      action: 'dislike',
      value: review.dislikes
    }
  ]
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
            <div class="flex items-center">{{ review.users.name }}</div>
            <div class="flex gap-x-2 items-center">
              <RatingStars :model-value="review.rating" />
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
          <button>asdaasdads</button>
          <div class="flex gap-x-6">
            <div
              v-for="(el, i) in ratingBtns(review)"
              :key="i"
              class="flex gap-x-2"
            >
              <button
                class="review__arrow"
                @click="evaluationReview(review, el.type)"
              >
                <ArrowSVG
                  :class="[
                    el.action,
                    userAlreadyRated(review) === el.type && 'coloured'
                  ]"
                />
              </button>
              <span>{{ el.value }}</span>
            </div>
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
  display: flex
  flex-direction: column
  gap: 50px
  .review
    background: #f6f6f6
    border-radius: 8px
    padding: 8px 16px
    &__arrow
      cursor: pointer
      &:hover .like
        fill: var(--color-main)
      &:hover .dislike
        fill: #f44336
      svg
        width: 16px
        transition: .1s
        &.dislike
          transform: rotate(180deg)
          &.coloured
            fill: #f44336
        &.like.coloured
          fill: var(--color-main)
</style>
