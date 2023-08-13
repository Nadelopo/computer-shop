<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { createOne, getAll, updateOne } from '@/utils/queries/db'
import { useUserStore } from '@/stores/userStore'
import VPagination from '../UI/VPagination.vue'
import RatingStars from '../RatingStars.vue'
import ReviewsBlock from './ReviewsBlock.vue'
import VButton from '@/components/UI/VButton.vue'
import type {
  ReviewCreateRating,
  ReviewReadWithDetails,
  UsersRated
} from '@/types/tables/reviews.types'
import type { UpdateProductRating } from '@/pages/Product.vue'

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

const toast = useToast()
const route = useRoute()
const router = useRouter()

const { user } = storeToRefs(useUserStore())

const categoryId = Number(route.params.categoryId)
const commId = String(route.query.comm_id)

const reviews = ref<ReviewReadWithDetails[]>([])
const showReviewForm = ref(false)
const reviewsLimit = 6
const currentPage = ref(0)
const reviewsCount = ref(0)

const loadReviews = async () => {
  currentPage.value = route.query.page ? Number(route.query.page) - 1 : 0
  const { data, count } = await getAll<ReviewReadWithDetails>('reviews', {
    match: { productId: props.productId },
    select: '*, users(name)',
    order: {
      value: 'created_at',
      ascending: false
    },
    range: [
      currentPage.value * reviewsLimit,
      currentPage.value * reviewsLimit + reviewsLimit - 1
    ]
  })

  if (data && count !== null) {
    reviews.value = data
    reviewsCount.value = count
    await nextTick()
    const el = document.getElementById(commId)

    if (el) {
      setTimeout(() => {
        el.scrollIntoView()
      }, 100)
    }
  }
}

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
    toast.warning('Только авторизованные пользователи\n могут оставлять отзывы')
  } else if (form.value.rating === 0) {
    toast.warning('Укажите оценку')
  } else {
    const data = await createOne<ReviewReadWithDetails>(
      'reviews',
      {
        userId: user.value.id,
        productId: props.productId,
        dignities: form.value.dignities || null,
        disadvantages: form.value.disadvantages || null,
        comment: form.value.comment || null,
        rating: form.value.rating,
        categoryId
      },
      {
        select: '*, users(name)'
      }
    )
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
    toast.warning('Только авторизованные пользователи\n могут ставить оценки', {
      timeout: 3000
    })
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

watch(() => props.productId, loadReviews, {
  immediate: true
})

const clickOnPaginate = () => {
  router.push({ query: { ...route.query, page: currentPage.value + 1 } })
}

watch(
  () => route.query.page,
  () => {
    loadReviews()
  }
)
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
        <template v-for="review in reviews" :key="review.id">
          <reviews-block
            :id="review.id"
            :review="review"
            :class="{ active: commId === String(review.id) }"
            :user-already-rated="userAlreadyRated"
            :static="false"
            @on-click="evaluationReview"
          />
        </template>
      </div>
      <v-pagination
        v-model="currentPage"
        :item-count="reviewsCount"
        :page-size="reviewsLimit"
        :on-click="clickOnPaginate"
        class="mb-8"
      />
    </div>
  </div>
</template>

<style scoped lang="sass">
.review__form
  overflow: hidden
  padding-left: 8px
  margin-top: 30px
  height: 700px
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

.reviews
  margin: 50px 0
  display: flex
  flex-direction: column
  gap: 50px
  .active
    box-shadow: 0 0 3px 0px #51c7bd
</style>
