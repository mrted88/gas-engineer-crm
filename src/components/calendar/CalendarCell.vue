<template>
    <div
      class="calendar-cell"
      @dragover.prevent
      @drop="handleDrop"
      @click="handleClick"
    >
      <slot></slot>
    </div>
  </template>
  
  <script setup lang="ts">
  const props = defineProps<{
    date: Date
    hour?: number
  }>()
  
  const emit = defineEmits<{
    (e: 'click', date: Date, hour?: number): void
    (e: 'drop', eventId: string, date: Date, time: string): void
  }>()
  
  function handleClick() {
    emit('click', props.date, props.hour)
  }
  
  function handleDrop(e: DragEvent) {
    e.preventDefault()
    const eventId = e.dataTransfer?.getData('text/plain')
    if (eventId) {
      const time = props.hour 
        ? `${props.hour.toString().padStart(2, '0')}:00`
        : '09:00'
      emit('drop', eventId, props.date, time)
    }
  }
  </script>
  
  <style scoped>
  .calendar-cell {
    border: 1px solid var(--border-color);
    padding: 0.5rem;
    min-height: 100px;
    background: var(--surface-1);
    transition: background 0.3s;
  }
  
  .calendar-cell:hover {
    background: var(--surface-2);
  }
  </style>