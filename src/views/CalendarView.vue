<template>
  <div class="page-container">
    <h1>Calendar</h1>
    <CalendarView />
  </div>
</template>

<script setup lang="ts">
import CalendarView from '@/components/calendar/CalendarView.vue'
</script>

<style scoped>
.page-container {
  padding: var(--space-4);
}
</style>