<script setup lang="ts">
import { ref } from 'vue'
import VButton from '@/components/UI/VButton.vue'
// import AvatarSvg from '@/assets/icons/avatar.svg?component'

const showReviewForm = ref(false)
</script>

<template>
  <div class="wrapper grid">
    <div>Отзывы</div>
    <div>
      <v-button class="ml-2" @click="showReviewForm = !showReviewForm">
        написать отзыв
      </v-button>
      <Transition name="reviews">
        <div v-if="showReviewForm" class="reviews">
          <div>
            <div>Достоинства</div>
            <textarea />
          </div>
          <div>
            <div>Недостатки</div>
            <textarea />
          </div>
          <div>
            <div>Комментарий</div>
            <textarea />
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped lang="sass">
.reviews
  overflow: hidden
  padding-left: 8px
  margin-top: 30px
  height: 700px
  div
    font-size: 20px
    font-weight: 500
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
    max-height: 700px
    border: none
    box-shadow: 0 0 5px 0 var(--color-text)
    transition: box-shadow .6s

.reviews-move,
.reviews-enter-active,
.reviews-leave-active
  transition: all 0.5s ease

.reviews-enter-from,
.reviews-leave-to
  opacity: 0
  transition: all 0.5s ease
  height: 0px
</style>
