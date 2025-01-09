<template>
    <div
      class="calendar-event"
      :class="[statusClass, { 'is-dragging': isDragging }]"
      :style="eventStyle"
      @click="handleClick"
      draggable="true"
      @dragstart="handleDragStart"
      @dragend="handleDragEnd"
    >
      <div class="event-time">{{ formattedTime }}</div>
      <div class="event-title">{{ event.title }}</div>
      <div class="event-customer">{{ event.customerName }}</div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  import { format, parse } from 'date-fns';
  import type { CalendarEvent } from '@/types/event';
  
  interface Props {
    event: CalendarEvent;
    isDragging?: boolean;
  }
  
  const props = withDefaults(defineProps<Props>(), {
    isDragging: false,
  });
  
  const emit = defineEmits<{
    (e: 'click', event: CalendarEvent): void;
    (e: 'dragstart', event: DragEvent): void;
    (e: 'dragend'): void;
  }>();
  
  const statusClass = computed(() => `status-${props.event.status}`);
  
  const formattedTime = computed(() => {
    try {
      // Parse the time string into a Date object
      const timeParts = props.event.time.split(':');
      const date = new Date();
      date.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]), 0);
  
      // Format the time
      return format(date, 'HH:mm');
    } catch (error) {
      console.error('Invalid time format:', props.event.time);
      return 'Invalid time';
    }
  });
  
  const eventStyle = computed(() => {
    return {
      backgroundColor: getEventColor(props.event.status),
    };
  });
  
  function getEventColor(status: string): string {
    switch (status) {
      case 'scheduled':
        return 'var(--primary-500)';
      case 'completed':
        return 'var(--success-500)';
      case 'cancelled':
        return 'var(--error-500)';
      default:
        return 'var(--gray-500)';
    }
  }
  
  function handleClick() {
    emit('click', props.event);
  }
  
  function handleDragStart(e: DragEvent) {
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', props.event.id);
    }
    emit('dragstart', e);
  }
  
  function handleDragEnd() {
    emit('dragend');
  }
  </script>
  
  <style scoped>
  .calendar-event {
    padding: 0.5rem;
    border-radius: var(--radius-md);
    color: white;
    cursor: pointer;
    user-select: none;
    transition: all 0.2s ease;
    margin-bottom: 0.25rem;
  }
  
  .calendar-event:hover {
    filter: brightness(110%);
  }
  
  .calendar-event.is-dragging {
    opacity: 0.5;
  }
  
  .event-time {
    font-size: var(--font-size-sm);
    font-weight: 500;
    margin-bottom: 0.25rem;
  }
  
  .event-title {
    font-weight: 600;
    margin-bottom: 0.25rem;
  }
  
  .event-customer {
    font-size: var(--font-size-sm);
    opacity: 0.9;
  }
  
  /* Status-specific styles */
  .status-scheduled {
    border-left: 3px solid var(--primary-700);
  }
  
  .status-completed {
    border-left: 3px solid var(--success-700);
  }
  
  .status-cancelled {
    border-left: 3px solid var(--error-700);
  }
  </style>