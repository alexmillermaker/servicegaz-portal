<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import AppToast from '@/shared/ui/AppToast.vue'
import AppOfflineBanner from '@/shared/ui/AppOfflineBanner.vue'
import AppSessionWarning from '@/shared/ui/AppSessionWarning.vue'
import AppErrorBoundary from '@/shared/ui/AppErrorBoundary.vue'

const route = useRoute()
const NAV_ORDER = ['Profile', 'NewsList', 'Navigate', 'Documents', 'AdminDashboard']
const direction = ref<'forward' | 'back' | 'fade'>('fade')

watch(() => route.path, (path) => {
  if (path.startsWith('/admin')) {
    document.body.classList.add('admin-mode')
  } else {
    document.body.classList.remove('admin-mode')
  }
}, { immediate: true })

watch(() => route.name, (next, prev) => {
  const ni = NAV_ORDER.indexOf(String(next))
  const pi = NAV_ORDER.indexOf(String(prev))
  direction.value = (ni !== -1 && pi !== -1)
    ? (ni > pi ? 'forward' : 'back')
    : 'fade'
})
</script>

<template>
  <AppOfflineBanner />
  <AppSessionWarning />

  <AppErrorBoundary>
    <RouterView v-slot="{ Component }">
      <Transition
        :name="direction === 'forward' ? 'slide-left' : direction === 'back' ? 'slide-right' : 'page'"
        mode="out-in"
      >
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>
  </AppErrorBoundary>

  <AppToast />
</template>
