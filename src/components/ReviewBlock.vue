<script setup lang="ts">
import { computed } from 'vue'
import RatingStars from './RatingStars.vue'
import ActionIcon from './ActionIcon.vue'
import { AvatarSvg, ArrowSvg } from '@/assets/icons'
import type { ReviewReadWithDetails } from '@/types/tables/reviews.types'

type Evaluation = 'like' | 'dislike'

type Props = {
  review: ReviewReadWithDetails
  color?: string
  static?: boolean
  getUserEvaluation?: (
    review: ReviewReadWithDetails['usersRated']
  ) => Evaluation | null
}

const props = withDefaults(defineProps<Props>(), {
  static: true
})

const emit = defineEmits<{
  onClick: [review: ReviewReadWithDetails, type: Evaluation]
}>()

const color = props.color ?? '#f6f6f6'

const onClick = (review: ReviewReadWithDetails, type: Evaluation) => {
  emit('onClick', review, type)
}

const isArrowActive = (review: ReviewReadWithDetails, type: Evaluation) => {
  if (props.static) return
  return props.getUserEvaluation?.(review.usersRated) === type
}

const evalatuationClasses = computed(() => {
  if (!props.static && props.review.evaluation === 0) return ''
  let classes = props.static ? 'static' : ''
  if (props.review.evaluation > 0) {
    classes += ' positive '
  }
  if (props.review.evaluation < 0) {
    classes += ' negative '
  }
  return classes
})
</script>

<template>
  <div class="review__root">
    <div class="head">
      <avatar-svg
        width="40"
        fill="#cdcdcd"
      />
      <div>{{ review.users.name }}</div>
      <rating-stars
        class="rating"
        :model-value="review.rating"
      />
      <div class="ml-auto">
        {{ new Date(review.created_at).toLocaleDateString() }}
      </div>
    </div>
    <div
      v-if="review.dignities"
      class="mb-4 mt-6"
    >
      <div class="title">Достоинства</div>
      <div>{{ review.dignities }}</div>
    </div>
    <div
      v-if="review.disadvantages"
      class="mb-4"
    >
      <div class="title">Недостатки</div>
      <div>{{ review.disadvantages }}</div>
    </div>
    <div
      v-if="review.comment"
      class="mb-4"
    >
      <div class="title">Комментарий</div>
      <div>{{ review.comment }}</div>
    </div>
    <div class="flex mt-4">
      <div class="flex">
        <action-icon
          v-if="!static"
          :svg="ArrowSvg"
          :is-active="isArrowActive(review, 'like')"
          @click="onClick(review, 'like')"
        />
        <span
          class="px-4 evaluation__count"
          :class="evalatuationClasses"
          data-contet="★"
        >
          {{ review.evaluation }}
        </span>
        <action-icon
          v-if="!static"
          :svg="ArrowSvg"
          :svg-attrs="{ transform: 'rotate(180)' }"
          variant="danger"
          :is-active="isArrowActive(review, 'dislike')"
          @click="onClick(review, 'dislike')"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="sass">
.review__root
  background: v-bind(color)
  border-radius: 8px
  padding: 8px 16px
  @media (width < 640px)
    padding: 8px
  .head
    display: grid
    column-gap: 20px
    grid-template-columns: repeat(3, auto) 1fr
    align-items: center
    @media (width < 1024px)
      grid-template-columns: auto 1fr auto
      grid-template-rows: auto auto
      grid-template-areas: ". . ." "bottom bottom bottom"
      row-gap: 4px
  .rating
    @media (width < 1024px)
      grid-area: bottom
  .title
    font-size: 20px
    font-weight: 500
    margin-bottom: 10px
  .evaluation__count
    width: 44px
    display: flex
    justify-content: center
    align-items: center
    &.positive
      color: var(--main-semi-light)
    &.negative
      color: var(--danger-semi-light)
    &.static
      padding: 0
      &::before
        content: attr(data-contet)
        margin-right: 4px
  .arrow
    cursor: pointer
    width: 16px
    transition: .1s
    &:hover.like
      fill: var(--main-semi-light)
    &:hover.dislike
      fill: var(--danger-semi-light)
    &.dislike
      transform: rotate(180deg)
      &.coloured
        fill: var(--danger-semi-light)
    &.like.coloured
      fill: var(--main-semi-light)
</style>
