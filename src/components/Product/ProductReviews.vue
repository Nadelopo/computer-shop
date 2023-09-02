<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { useUserStore } from '@/stores/userStore'
import { createOne, getAll, updateOneById } from '@/utils/queries/db'
import RatingStars from '../RatingStars.vue'
import ReviewsBlock from './ReviewsBlock.vue'
import { VButton, VPagination } from '@/components/UI'
import type {
  ReviewRating,
  ReviewReadWithDetails,
  UsersRated
} from '@/types/tables/reviews.types'
import type { UpdateProductRating } from '@/pages/Product.vue'
import type { Loading } from '@/types'

type ReviewFormCreate = {
  dignities: string
  disadvantages: string
  comment: string
  rating: ReviewRating | 0
}

const props = defineProps<{
  productId: number
  countReviews: number
  productRating: number
}>()

const emit = defineEmits<{
  updateProductRating: [newRating: UpdateProductRating]
}>()

const toast = useToast()
const route = useRoute()
const router = useRouter()

const { user } = storeToRefs(useUserStore())

const categoryId = Number(route.params.categoryId)
const commId = computed(() => route.query.comm_id)

const reviews = ref<ReviewReadWithDetails[]>([])
const showReviewForm = ref(false)
const reviewsLimit = 6
const currentPage = ref(route.query.page ? Number(route.query.page) - 1 : 0)
const reviewsCount = ref(0)
const loading = ref<Loading | 'init'>('init')

const purifiedForm: ReviewFormCreate = {
  dignities: '',
  disadvantages: '',
  comment: '',
  rating: 0
}

const form = ref<ReviewFormCreate>({
  ...purifiedForm
})

const toggleFormVisibility = () => {
  if (!user.value) {
    toast.warning('Требуется авторизация')
    return
  }
  showReviewForm.value = !showReviewForm.value
}

const createReview = async () => {
  if (!user.value) return
  if (form.value.rating === 0) {
    toast.warning('Укажите оценку')
  } else {
    const data = await createOne(
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
      '*, users(name)'
    )
    if (data) {
      reviews.value.unshift(data)
      form.value = { ...purifiedForm }
      showReviewForm.value = false

      const newProductRating =
        (props.productRating * props.countReviews + data.rating) /
        (props.countReviews + 1)
      const productData = await updateOneById('products', props.productId, {
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

const getUserEvaluation = (
  review: ReviewReadWithDetails
): 'like' | 'dislike' | null => {
  const findUser = review.usersRated.find((e) => e.userId === user.value?.id)
  if (!findUser) return null
  return findUser.evaluation ? 'like' : 'dislike'
}

const evaluationReview = async (
  review: ReviewReadWithDetails,
  evaluation: 'like' | 'dislike'
) => {
  if (!user.value) {
    toast.warning('Только авторизованные пользователи\n могут ставить оценки', {
      timeout: 3000
    })
    return
  }
  if (review.userId === user.value.id) {
    toast.warning('Нельзя изменить рейтинг собственного комментария')
    return
  }

  const prevEvaluation = getUserEvaluation(review)

  let newEvaluation = review.evaluation
  let newUsersRated: UsersRated[] = review.usersRated

  if (!prevEvaluation) {
    if (evaluation === 'like') newEvaluation++
    else newEvaluation--
    newUsersRated.push({
      userId: user.value.id,
      evaluation: evaluation === 'like' ? true : false
    })
  } else {
    if (prevEvaluation === 'like' && evaluation === 'like') {
      newEvaluation--
      newUsersRated = newUsersRated.filter((e) => e.userId !== user.value?.id)
    } else if (prevEvaluation === 'like' && evaluation === 'dislike') {
      newEvaluation -= 2
      newUsersRated = newUsersRated.map((e) =>
        e.userId === user.value?.id ? { ...e, evaluation: false } : e
      )
    } else if (prevEvaluation === 'dislike' && evaluation === 'like') {
      newEvaluation += 2
      newUsersRated = newUsersRated.map((e) =>
        e.userId === user.value?.id ? { ...e, evaluation: true } : e
      )
    } else if (prevEvaluation === 'dislike' && evaluation === 'dislike') {
      newEvaluation++
      newUsersRated = newUsersRated.filter((e) => e.userId !== user.value?.id)
    }
  }
  const newValues = {
    evaluation: newEvaluation,
    usersRated: newUsersRated
  }
  const data = await updateOneById('reviews', review.id, newValues)

  if (data) {
    reviews.value = reviews.value.map((e) =>
      review.id === e.id ? { ...e, ...newValues } : e
    )
  }
}

const clickOnPaginate = () => {
  router.replace({ query: { page: currentPage.value + 1 } })
}

const loadReviews = async () => {
  if (loading.value === 'loading') return
  loading.value = 'loading'
  const { data, count } = await getAll('reviews', {
    match: { productId: props.productId },
    select: '*, users(name)',
    order: ['created_at', false],
    range: [
      currentPage.value * reviewsLimit,
      currentPage.value * reviewsLimit + reviewsLimit - 1
    ]
  })
  if (data && count !== null) {
    reviews.value = data
    reviewsCount.value = count
  }
  loading.value = 'success'
}

onMounted(async () => {
  if (commId.value) {
    const reviewReferenceId = Number(commId.value)
    const { data, count } = await getAll('reviews', {
      select: 'id',
      match: {
        productId: props.productId
      }
    })
    const reviewIndex = data?.findIndex((e) => e.id === reviewReferenceId)
    if (reviewIndex !== undefined && count !== null) {
      const pageWithComment = Math.ceil(
        (count - (reviewIndex - 1)) / reviewsLimit
      )
      currentPage.value = pageWithComment - 1
      router.replace({
        query: {
          ...route.query,
          page: pageWithComment
        }
      })
      await loadReviews()
      const el = document.getElementById('comment_' + commId.value)
      if (el) {
        el.scrollIntoView()
      }
    }
  } else {
    loadReviews()
  }
})

watch(currentPage, loadReviews)
</script>

<template>
  <div class="wrapper grid">
    <div>Отзывы</div>
    <div>
      <v-button class="ml-2" @click="toggleFormVisibility">
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
            :id="'comment_' + review.id"
            :review="review"
            :class="{ active: commId === String(review.id) }"
            :get-user-evaluation="getUserEvaluation"
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

.reviews
  margin: 40px 0
  display: flex
  flex-direction: column
  gap: 50px
  .active
    box-shadow: 0 0 3px 0px #51c7bd
</style>
