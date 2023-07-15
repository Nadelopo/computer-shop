<script setup lang="ts">
import RatingStars from '../RatingStars.vue'
import AvatarSvg from '@/assets/icons/avatar.svg?component'
import ArrowSVG from '@/assets/icons/arrow.svg?component'
import type { ReviewReadWithDetails } from '@/types/tables/reviews.types'

type Props = {
  review: ReviewReadWithDetails
  color?: string
  static?: boolean
  userAlreadyRated?: (
    review: ReviewReadWithDetails,
    type: boolean
  ) => boolean | null
}

const props = withDefaults(defineProps<Props>(), {
  static: true
})

const emit = defineEmits<{
  onClick: [review: ReviewReadWithDetails, type: boolean]
}>()

const color = props.color ?? '#f6f6f6'

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

const onClick = (review: ReviewReadWithDetails, type: boolean) => {
  emit('onClick', review, type)
}

const arrowSvgClasse = (review: ReviewReadWithDetails, type: boolean) => {
  let typeClass = type ? 'like' : 'dislike'
  if (props.static) {
    return typeClass + ' coloured'
  } else {
    const isColoured =
      props.userAlreadyRated?.(review, type) === type ? ' coloured' : ''
    return typeClass + isColoured
  }
}
</script>

<template>
  <div class="review__root">
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
    <div class="flex gap-x-6 mt-4">
      <div v-for="(el, i) in ratingBtns(review)" :key="i" class="flex gap-x-2">
        <button class="review__root__arrow" @click="onClick(review, el.type)">
          <ArrowSVG :class="arrowSvgClasse(review, el.type)" />
        </button>
        <span>{{ el.value }}</span>
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
  &__arrow
    cursor: pointer
    &:hover .like
      fill: var(--color-text)
    &:hover .dislike
      fill: var(--danger-light)
    svg
      width: 16px
      transition: .1s
      &.dislike
        transform: rotate(180deg)
        &.coloured
          fill: var(--danger-light)
      &.like.coloured
        fill: var(--color-text)
</style>
