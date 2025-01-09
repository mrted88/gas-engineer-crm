<template>
  <div class="day-view">
    <!-- Time Column -->
    <div class="time-column">
      <div v-for="hour in hours" :key="hour" class="time-slot">
        {{ formatHour(hour) }}
      </div>
    </div>

    <!-- Day Content -->
    <div class="day-content">
      <!-- Day Header -->
      <div class="day-header">
        <div class="day-title" :class="{ today: isToday }">
          {{ dayTitle }}
        </div>
      </div>

      <!-- Day Body -->
      <div class="day-body">
        <div 
          v-for="hour in hours" 
          :key="hour"
          class="hour-slot"
          :class="{
            'unavailable': !isTimeSlotAvailable(hour),
            'has-conflict': hasTimeSlotConflict(hour),
            'drag-over': isDragOver === hour
          }"
          @click="$emit('date-click', currentDate, hour)"
          @dragover.prevent="handleDragOver(hour)"
          @dragleave="handleDragLeave"
          @drop="(e: DragEvent) => handleDrop(e, hour)"
        >
          <CalendarEventComponent
            v-for="event in getEventsForHour(hour)"
            :key="event.id"
            :event="event"
            :is-dragging="isDragging && draggedEvent?.id === event.id"
            @click.stop="$emit('event-click', event)"
            @dragstart="(e: DragEvent) => handleDragStart(e, event)"
            @dragend="handleDragEnd"
            draggable="true"
          />
        </div>
      </div>
    </div>

    <!-- Side Panel (Optional) -->
    <div v-if="showSidePanel" class="day-side-panel">
      <div class="panel-header">
        <h3>Schedule Overview</h3>
      </div>
      <div class="panel-content">
        <div 
          v-for="event in sortedDayEvents" 
          :key="event.id"
          class="panel-event"
          :class="event.status"
          @click="$emit('event-click', event)"
        >
          <div class="event-time">{{ formatEventTime(event.time) }}</div>
          <div class="event-title">{{ event.title }}</div>
          <div class="event-customer">{{ event.customerName }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { format, addHours, startOfDay, isToday as dateFnsIsToday } from 'date-fns'
import type { CalendarEvent as ICalendarEvent } from '@/types/calendar'
import CalendarEventComponent from './CalendarEvent.vue'

const props = defineProps<{
  currentDate: Date
  events: ICalendarEvent[]
  showSidePanel?: boolean
}>()

const emit = defineEmits<{
  'event-click': [event: ICalendarEvent]
  'date-click': [date: Date, hour: number]
  'event-drop': [event: ICalendarEvent, date: Date, hour: number]
}>()

// State
const isDragging = ref(false)
const draggedEvent = ref<ICalendarEvent | null>(null)
const isDragOver = ref<number | null>(null)

// Constants
const hours = Array.from({ length: 12 }, (_, i) => i + 8) // 8 AM to 7 PM

// Computed
const isToday = computed(() => dateFnsIsToday(props.currentDate))

const dayTitle = computed(() => 
  format(props.currentDate, 'EEEE, MMMM d, yyyy')
)

const sortedDayEvents = computed(() => 
  props.events
    .filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.getDate() === props.currentDate.getDate() && 
             eventDate.getMonth() === props.currentDate.getMonth() && 
             eventDate.getFullYear() === props.currentDate.getFullYear()
    })
    .sort((a, b) => a.time.localeCompare(b.time))
)

// Methods
function formatHour(hour: number): string {
  return format(addHours(startOfDay(new Date()), hour), 'h a')
}

function formatEventTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const date = new Date()
  date.setHours(parseInt(hours), parseInt(minutes))
  return format(date, 'h:mm a')
}

function getEventsForHour(hour: number): ICalendarEvent[] {
  return sortedDayEvents.value.filter(event => {
    const eventHour = parseInt(event.time.split(':')[0])
    return eventHour === hour
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
  isDragOver.value = null
}

function handleDragOver(hour: number) {
  isDragOver.value = hour
}

function handleDragLeave() {
  isDragOver.value = null
}

function handleDrop(e: DragEvent, hour: number) {
  e.preventDefault()
  isDragOver.value = null
  
  const eventId = e.dataTransfer?.getData('text/plain')
  if (eventId && draggedEvent.value) {
    const newTime = `${hour.toString().padStart(2, '0')}:00`
    emit('event-drop', draggedEvent.value, props.currentDate, hour)
  }
  
  // Reset drag state
  isDragging.value = false
  draggedEvent.value = null
}

function isTimeSlotAvailable(hour: number): boolean {
  // Get events for this hour
  const hourEvents = getEventsForHour(hour)
  
  // Consider a slot unavailable if it has more than 2 events
  // You can adjust this logic based on your needs
  return hourEvents.length < 2
}

function hasTimeSlotConflict(hour: number): boolean {
  // Get events for this hour
  const hourEvents = getEventsForHour(hour)
  
  // Check for overlapping events
  if (hourEvents.length > 1) {
    // Simple check: if there's more than one event in the hour
    return true
  }
  
  return false
}
</script>

<style scoped>
.day-view {
  display: flex;
  flex: 1;
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

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

.day-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.day-header {
  padding: var(--space-4);
  border-bottom: 1px solid var(--border-color);
  background: var(--surface-1);
}

.day-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-1);
}

.day-title.today {
  color: var(--primary-blue);
}

.day-body {
  flex: 1;
  overflow-y: auto;
  background: var(--surface-1);
}

.hour-slot {
  height: 60px;
  border-bottom: 1px solid var(--border-color);
  position: relative;
}

.hour-slot:hover {
  background: var(--surface-2);
}

.hour-slot.unavailable {
  background: var(--surface-3);
  cursor: not-allowed;
}

.hour-slot.has-conflict {
  background: var(--error-50);
}

.hour-slot.drag-over {
  background: var(--primary-50);
  border: 2px dashed var(--primary-blue);
}

@media (prefers-color-scheme: dark) {
  .hour-slot.drag-over {
    background: var(--primary-900);
    border-color: var(--primary-500);
  }
}

.day-side-panel {
  width: 300px;
  border-left: 1px solid var(--border-color);
  background: var(--surface-1);
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: var(--space-4);
  border-bottom: 1px solid var(--border-color);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-2);
}

.panel-event {
  padding: var(--space-2);
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-2);
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--surface-2);
}

.panel-event:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.panel-event .event-time {
  font-weight: 600;
  font-size: var(--font-size-sm);
}

.panel-event .event-title {
  margin: var(--space-1) 0;
}

.panel-event .event-customer {
  font-size: var(--font-size-sm);
  color: var(--text-2);
}

@media (max-width: 1024px) {
  .day-side-panel {
    display: none;
  }
}

@media (max-width: 768px) {
  .time-column {
    width: 50px;
  }

  .day-title {
    font-size: var(--font-size-base);
  }
}
</style>