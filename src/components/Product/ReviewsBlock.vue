<script setup lang="ts">
import { computed } from 'vue'
import RatingStars from '../RatingStars.vue'
import { AvatarSvg, ArrowSvg } from '@/assets/icons'
import type { ReviewReadWithDetails } from '@/types/tables/reviews.types'

type Evaluation = 'like' | 'dislike'

type Props = {
  review: ReviewReadWithDetails
  color?: string
  static?: boolean
  getUserEvaluation?: (review: ReviewReadWithDetails) => Evaluation | null
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

const arrowSvgClasse = (review: ReviewReadWithDetails, type: Evaluation) => {
  if (props.static) {
    return type + ' coloured'
  } else {
    const isColoured =
      props.getUserEvaluation?.(review) === type ? ' coloured' : ''
    return type + isColoured
  }
}

const evalatuationClasses = computed(() => {
  if (props.review.evaluation === 0) return ''
  const staticMod = props.static ? 'static' : ''
  return (props.review.evaluation > 0 ? 'positive ' : 'negative ') + staticMod
})
</script>

<template>
  <div class="review__root">
    <div class="flex gap-x-6">
      <avatar-svg width="40" fill="#cdcdcd" />
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
    <div class="flex mt-4">
      <div class="flex">
        <arrow-svg
          v-if="!static"
          :class="arrowSvgClasse(review, 'like')"
          class="arrow"
          @click="onClick(review, 'like')"
        />
        <span
          class="px-4 evaluation__count"
          :class="evalatuationClasses"
          :data-contet="static ? '★' : ''"
        >
          {{ review.evaluation }}
        </span>
        <arrow-svg
          v-if="!static"
          :class="arrowSvgClasse(review, 'dislike')"
          class="arrow"
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
  .title
    font-size: 20px
    font-weight: 500
    margin-bottom: 10px
  .evaluation__count
    &.positive
      color: var(--color-text)
    &.negative
      color: var(--danger-light)
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
      fill: var(--color-text)
    &:hover.dislike
      fill: var(--danger-light)
    &.dislike
      transform: rotate(180deg)
      &.coloured
        fill: var(--danger-light)
    &.like.coloured
      fill: var(--color-text)
</style>
