<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
})
const emit = defineEmits(['update:isOpen'])

const translateSidebar = ref('-320px')
const brightness = ref('1')
// const close = ref(false)

const sidebarRef = ref()
const isMounted = ref(false)

const closeSidebar = () => {
  removeEventListener('click', checkClick)
  translateSidebar.value = '-320px'
  brightness.value = '1'
  // close.value = true
  setTimeout(() => emit('update:isOpen', false), 100)
}

const checkClick = (event: MouseEvent) => {
  if (
    sidebarRef.value &&
    !event.composedPath().includes(sidebarRef.value) &&
    isMounted.value
  ) {
    closeSidebar()
  }
  isMounted.value = true
}

onMounted(() => {
  addEventListener('click', checkClick)
  setTimeout(() => (translateSidebar.value = '0px'))
  setTimeout(() => (brightness.value = '0.4'))
})
onUnmounted(() => removeEventListener('click', checkClick))
</script>

<template>
  <div>
    <div class="wrapper">
      <div ref="sidebarRef" class="sidebar">
        <div class="grid grid-cols-2 items-center">
          <div>
            <router-link :to="{ name: 'Home' }" @click="closeSidebar">
              <img
                src="@/assets/img/logoChangeWhiteSizeFnew.png"
                width="95"
                alt=""
              />
            </router-link>
          </div>
          <div class="text-end">
            <button @click="closeSidebar">
              <div class="dot dot-f"></div>
              <div class="dot dot-l"></div>
            </button>
          </div>
        </div>
        <div class="list">
          <div>Главная</div>
          <div>Товары</div>
          <div>О нас</div>
          <div>Доставка</div>
          <div>Контакты</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="sass">
.wrapper
  z-index: 100
  width: 100%
  position: absolute
  height: 100%
  top: 0
  bottom: 0
  left: 0
  right: 0
  transition: .2s
  backdrop-filter: brightness(v-bind(brightness))
  .sidebar
    position: absolute
    background: var(--back-main)
    min-width: 320px
    top: 0
    translate: v-bind(translateSidebar)
    height: 100%
    color: #fff
    padding: 20px
    transition: .2s
    .list
      margin-top: 20px
      font-size: 20px
      display: flex
      flex-direction: column
      gap: 10px
      div
        padding-left: 20px

.dot
  transition: .2s
  width: 40px
  margin: 10px 0
  background: #fff
  height: 3px
  transform-origin: 27%
  border-radius: 4px
  &-f
    transform: rotate(45deg)
    // &__close
    //   transform: rotate(0)
  &-l
    transform: rotate(-45deg)
    // &__close
    //   transform: rotate(0)
</style>
