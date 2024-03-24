<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { useMediaQuery } from '@vueuse/core'
import { useUserStore } from '@/stores/userStore'
import { useCustomRouter } from '@/utils/useCustomRouter'
import { getAll, updateOneById } from '@/db/queries/tables'
import ReviewBlock from '@/components/ReviewBlock.vue'
import FormCreateReview from './FormCreateReview.vue'
import { VLoader, VPagination } from '@/components/UI'
import type {
  ReviewReadWithDetails,
  UsersRated
} from '@/types/tables/reviews.types'
import type { UpdateProductRating } from '@/pages/Product.vue'
import type { Loading } from '@/types'

const props = defineProps<{
  productId: number
  countReviews: number
  productRating: number
}>()

const emit = defineEmits<{
  updateProductRating: [newRating: UpdateProductRating]
}>()

const { user } = storeToRefs(useUserStore())

const getUserEvaluation = (
  review: ReviewReadWithDetails
): 'like' | 'dislike' | null => {
  const findUser = review.usersRated.find((e) => e.userId === user.value?.id)
  if (!findUser) return null
  return findUser.evaluation ? 'like' : 'dislike'
}

const reviews = ref<ReviewReadWithDetails[]>([])
const toast = useToast()
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

const router = useCustomRouter()
const route = useRoute()
const currentPage = ref(route.query.page ? Number(route.query.page) - 1 : 0)
const clickOnPaginate = () => {
  router.replace({ query: { page: currentPage.value + 1 } })
}

const reviewsCount = ref(0)
const reviewsLimit = 6
const loading = ref<Loading | 'init'>('init')
const loadReviews = async () => {
  if (loading.value === 'loading') return
  loading.value = 'loading'
  const { data, count } = await getAll('reviews', {
    match: { productId: props.productId },
    select: '*, users(name)',
    order: ['created_at', { ascending: false }],
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

const commId = route.query.comm_id
onMounted(async () => {
  if (commId) {
    const reviewReferenceId = Number(commId)
    const { data, count } = await getAll('reviews', {
      select: 'id',
      match: {
        productId: props.productId
      }
    })
    const reviewIndex = data?.findIndex((e) => e.id === reviewReferenceId)
    if (reviewIndex !== undefined && count !== null) {
      const pageWithComment = Math.ceil((count - reviewIndex) / reviewsLimit)
      currentPage.value = pageWithComment - 1
      router.replace({
        query: {
          ...route.query,
          page: pageWithComment
        }
      })
      await loadReviews()
      const el = document.getElementById('comment_' + commId)
      if (el) {
        el.scrollIntoView()
      }
    }
  } else {
    loadReviews()
  }
})

watch(currentPage, loadReviews)

const isPageSmall = useMediaQuery('(width < 400px)')
</script>

<template>
  <div class="wrapper grid">
    <div>Отзывы</div>
    <div>
      <form-create-review
        :product-id="productId"
        :product-rating="productRating"
        :count-reviews="countReviews"
        @update-product-rating="emit('updateProductRating', $event)"
        @create-review="reviews.unshift($event)"
      />
      <div
        v-if="reviews.length"
        class="reviews"
      >
        <template v-if="loading === 'success'">
          <template
            v-for="review in reviews"
            :key="review.id"
          >
            <review-block
              :id="'comment_' + review.id"
              :review="review"
              :class="{ active: commId === String(review.id) }"
              :get-user-evaluation="getUserEvaluation"
              :static="false"
              @on-click="evaluationReview"
            />
          </template>
        </template>
        <v-loader v-else />
      </div>
      <v-pagination
        v-model="currentPage"
        :item-count="reviewsCount"
        :page-size="reviewsLimit"
        :page-slots="isPageSmall ? 5 : 7"
        class="mb-8 justify-center md:justify-start"
        @click="clickOnPaginate"
      />
    </div>
  </div>
</template>

<style scoped lang="sass">
.reviews
  margin: 40px 0
  display: flex
  flex-direction: column
  gap: 50px
  .active
    box-shadow: 0 0 3px 0px #51c7bd
</style>
