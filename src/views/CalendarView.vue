<template>
  <div class="page-container">
    <h1>Calendar</h1>
    <CalendarComponent />
  </div>
</template>

<script setup lang="ts">
import CalendarComponent from '@/components/calendar/CalendarView.vue';
</script>

<style scoped>
.page-container {
  padding: var(--space-4);
}
</style>