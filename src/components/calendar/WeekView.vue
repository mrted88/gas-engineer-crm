<template>
  <div class="week-view-container">
    <!-- Time Column -->
    <div class="time-column">
      <div class="time-header"></div>
      <div v-for="hour in hours" :key="hour" class="time-slot">
        {{ formatHour(hour) }}
      </div>
    </div>

    <!-- Week Content -->
    <div class="week-content">
      <!-- Week Header -->
      <div class="week-header">
        <div 
          v-for="day in weekDays" 
          :key="format(day.date, 'yyyy-MM-dd')"
          class="week-day-header"
          :class="{ today: isToday(day.date) }"
        >
          <span class="day-name">{{ day.dayName }}</span>
          <span class="day-number">{{ day.dayNumber }}</span>
        </div>
      </div>

      <!-- Week Body -->
      <div class="week-body">
        <div 
          v-for="day in weekDays" 
          :key="format(day.date, 'yyyy-MM-dd')"
          class="day-column"
          @dragover.prevent
          @drop="(e) => handleDrop(e, day.date)"
        >
          <div 
            v-for="hour in hours" 
            :key="hour"
            class="hour-slot"
            :class="{
              'unavailable': !isTimeSlotAvailable(day.date, hour),
              'has-conflict': hasTimeSlotConflict(day.date, hour)
            }"
            @click="$emit('date-click', day.date, hour)"
          >
            <CalendarEventComponent
              v-for="event in getEventsForDateAndHour(day.date, hour)"
              :key="event.id"
              :event="event"
              :is-dragging="isDragging && draggedEvent?.id === event.id"
              @click="$emit('event-click', event)"
              @dragstart="handleDragStart($event, event)"
              @dragend="handleDragEnd"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { format, addHours, startOfDay, startOfWeek, addDays, isToday as dateFnsIsToday } from 'date-fns'
import type { CalendarEvent as ICalendarEvent } from '@/types/calendar'
import CalendarEventComponent from './CalendarEvent.vue'

const props = defineProps<{
  currentDate: Date
  events: ICalendarEvent[]
  isLoading: boolean
}>()

const emit = defineEmits<{
  'event-click': [event: ICalendarEvent]
  'date-click': [date: Date, hour: number]
  'event-drop': [event: ICalendarEvent, date: Date, hour: number]
}>()

// State
const isDragging = ref(false)
const draggedEvent = ref<ICalendarEvent | null>(null)

// Constants
const hours = Array.from({ length: 12 }, (_, i) => i + 8) // 8 AM to 7 PM

// Computed
const weekDays = computed(() => {
  const start = startOfWeek(props.currentDate)
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(start, i)
    return {
      date,
      dayName: format(date, 'EEE'),
      dayNumber: format(date, 'd')
    }
  })
})

// Methods
function formatHour(hour: number): string {
  return format(addHours(startOfDay(new Date()), hour), 'h a')
}

function isToday(date: Date): boolean {
  return dateFnsIsToday(date)
}

function isTimeSlotAvailable(date: Date, hour: number): boolean {
  // Implement your availability logic here
  // For example, check business hours, holidays, etc.
  return true
}

function hasTimeSlotConflict(date: Date, hour: number): boolean {
  // Implement your conflict checking logic here
  // For example, check overlapping appointments
  const eventsInSlot = getEventsForDateAndHour(date, hour)
  return eventsInSlot.length > 0
}

function getEventsForDateAndHour(date: Date, hour: number): ICalendarEvent[] {
  return props.events.filter(event => {
    const eventDate = new Date(event.date)
    const eventHour = parseInt(event.time.split(':')[0])
    return eventDate.getDate() === date.getDate() && 
           eventDate.getMonth() === date.getMonth() && 
           eventDate.getFullYear() === date.getFullYear() && 
           eventHour === hour
  })
}

function handleDragStart(e: DragEvent, event: ICalendarEvent) {
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', event.id)
  }
  isDragging.value = true
  draggedEvent.value = event
}

function handleDragEnd() {
  isDragging.value = false
  draggedEvent.value = null
}

function handleDrop(e: DragEvent, date: Date) {
  e.preventDefault()
  const eventId = e.dataTransfer?.getData('text/plain')
  if (!eventId || !draggedEvent.value) return

  const hour = new Date().getHours()
  emit('event-drop', draggedEvent.value, date, hour)
}
</script>

<style scoped>
/* Week View Container */
.week-view-container {
  display: flex;
  flex: 1;
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

/* Time Column */
.time-column {
  width: 60px;
  flex-shrink: 0;
  border-right: 1px solid var(--border-color);
  background: var(--surface-1);
}

.time-slot {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-2);
  font-size: var(--font-size-sm);
  border-bottom: 1px solid var(--border-color);
}

/* Week Content */
.week-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Week Header */
.week-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: var(--surface-1);
  border-bottom: 1px solid var(--border-color);
}

.week-day-header {
  padding: var(--space-2);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
}

.week-day-header.today {
  background-color: var(--primary-50);
  color: var(--primary-900);
  font-weight: 600;
}

.day-name {
  font-weight: 500;
  color: var(--text-2);
}

.day-number {
  font-size: var(--font-size-lg);
  font-weight: 600;
}

/* Week Body */
.week-body {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  overflow-y: auto;
  position: relative;
  background: var(--surface-1);
}

.day-column {
  position: relative;
  border-right: 1px solid var(--border-color);
}

.day-column:last-child {
  border-right: none;
}

/* Hour Slots */
.hour-slot {
  height: 60px;
  border-bottom: 1px solid var(--border-color);
  position: relative;
  transition: background-color 0.2s ease;
}

.hour-slot:hover {
  background-color: var(--surface-2);
}

.hour-slot.unavailable {
  background-color: var(--surface-3);
  cursor: not-allowed;
}

.hour-slot.has-conflict {
  background-color: var(--error-50);
}

/* Responsive Styles */
@media (max-width: 768px) {
  .week-day-header {
    padding: var(--space-1);
  }

  .day-number {
    font-size: var(--font-size-base);
  }

  .day-name {
    font-size: var(--font-size-sm);
  }
}

@media (max-width: 480px) {
  .week-view-container {
    flex-direction: column;
  }

  .time-column {
    width: 100%;
    height: 40px;
    display: flex;
    overflow-x: auto;
  }

  .time-slot {
    min-width: 60px;
  }

  .week-header {
    position: sticky;
    top: 0;
    z-index: 10;
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .hour-slot:hover {
    background-color: var(--surface-3);
  }

  .week-day-header.today {
    background-color: var(--primary-900);
    color: var(--primary-50);
  }
}
</style>