<template>
  <NavBar />
  <router-view v-slot="{ Component }">
    <Transition name="fade" mode="out-in">
      <Suspense>
        <component :is="Component" />
        <template #fallback>
          <LoadingSpinner />
        </template>
      </Suspense>
    </Transition>
  </router-view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import NavBar from '@/components/NavBar.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const authStore = useAuthStore()

onMounted(async () => {
  await authStore.checkAuth()
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>