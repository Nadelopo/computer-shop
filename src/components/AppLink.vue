<script setup lang="ts" generic="T extends RouteName">
import type { RouteLocationRaw, RouterLink, RouterLinkProps } from 'vue-router'
import type { RouteName, RouteParams, RouteParamsKeys } from '@/router/types'

export type ParamsType<
  T extends RouteName,
  P extends RouteLocationRaw
> = RouteParamsKeys<T> extends never ? Partial<P> : Required<P>

type RouterProps = Omit<RouterLinkProps, 'to'> & {
  to: Exclude<RouteLocationRaw, string> & {
    name: T
    params?: RouteParams<T>
  } & ParamsType<T, { params: RouteParams<T> }>
}

withDefaults(defineProps<RouterProps>(), {
  activeClass: 'router-link-active',
  exactActiveClass: 'router-link-exact-active'
})

defineOptions({
  inheritAttrs: false
})
</script>

<template>
  <!-- @vue-expect-error -->
  <router-link
    v-slot="{ isActive, href, navigate, isExactActive }"
    v-bind="$props"
    custom
  >
    <a
      v-bind="$attrs"
      :href="href"
      :class="[isActive && activeClass, isExactActive && exactActiveClass]"
      @click="navigate"
    >
      <slot />
    </a>
  </router-link>
</template>
