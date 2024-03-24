<script setup lang="ts" generic="T extends RouteName">
import type { RouterLink, RouterLinkProps } from 'vue-router'
// eslint-disable-next-line
import type { RouteName } from '@/router/types'
import type { RouterTo } from '@/utils/useCustomRouter'

type RouterProps = Omit<RouterLinkProps, 'to'> & {
  to: RouterTo<T>
}

defineProps<RouterProps>()
</script>

<template>
  <router-link v-bind="$props">
    <slot />
  </router-link>
</template>
