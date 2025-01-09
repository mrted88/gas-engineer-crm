<template>
  <div class="month-view">
    <!-- Weekday Headers -->
    <div class="weekdays">
      <div v-for="day in weekDays" :key="day">{{ day }}</div>
    </div>

    <!-- Calendar Days Grid -->
    <div class="days">
      <CalendarCell
        v-for="date in calendarDays"
        :key="format(date.date, 'yyyy-MM-dd')"
        :date="date.date"
        :class="{
          'other-month': !date.isCurrentMonth,
          'today': isToday(date.date),
          'has-events': hasEvents(date.date)
        }"
        @click="handleDateClick"
        @drop="handleEventDrop"
      >
        <span class="day-number">{{ date.dayNumber }}</span>
        <div class="day-events">
          <CalendarEventComponent
            v-for="event in getEventsForDate(date.date)"
            :key="event.id"
            :event="event"
            :compact="true"
            @click.stop="$emit('event-click', event)"
          />
          
          <div 
            v-if="getEventsForDate(date.date).length > 3" 
            class="more-events"
          >
            +{{ getEventsForDate(date.date).length - 3 }} more
          </div>
        </div>
      </CalendarCell>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isToday as dateFnsIsToday
} from 'date-fns'
import type { CalendarEvent as ICalendarEvent } from '@/types/calendar'
import CalendarEventComponent from './CalendarEvent.vue'
import CalendarCell from './CalendarCell.vue' // Import the CalendarCell component

const props = defineProps<{
  currentDate: Date
  events: ICalendarEvent[]
}>()

const emit = defineEmits<{
  'event-click': [event: ICalendarEvent]
  'date-click': [date: Date]
}>()

// Constants
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Computed
const calendarDays = computed(() => {
  const start = startOfWeek(startOfMonth(props.currentDate))
  const end = endOfWeek(endOfMonth(props.currentDate))
  
  return eachDayOfInterval({ start, end }).map(date => ({
    date,
    dayNumber: format(date, 'd'),
    isCurrentMonth: isSameMonth(date, props.currentDate)
  }))
})

// Methods
function isToday(date: Date): boolean {
  return dateFnsIsToday(date)
}

function hasEvents(date: Date): boolean {
  return getEventsForDate(date).length > 0
}

function getEventsForDate(date: Date): ICalendarEvent[] {
  return props.events.filter(event => {
    const eventDate = new Date(event.date)
    return eventDate.getDate() === date.getDate() && 
           eventDate.getMonth() === date.getMonth() && 
           eventDate.getFullYear() === date.getFullYear()
  }).sort((a, b) => {
    // Sort by time
    return a.time.localeCompare(b.time)
  }).slice(0, 4) // Limit to 4 events per day
}

function handleDateClick(date: Date) {
  emit('date-click', date)
}

function handleEventDrop(eventId: string, date: Date, time: string) {
  // Handle the event drop logic here
}
</script>

<style scoped>
/* Month View Container */
.month-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Weekday Headers */
.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: var(--surface-1);
  border-bottom: 1px solid var(--border-color);
  padding: var(--space-2);
}

.weekdays > div {
  text-align: center;
  font-weight: 500;
  color: var(--text-2);
}

/* Days Grid */
.days {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: minmax(100px, 1fr);
  gap: 1px;
  background: var(--border-color);
}

/* Individual Day Cell */
.day {
  background: var(--surface-1);
  padding: var(--space-2);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  position: relative;
  min-height: 120px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.day:hover {
  background: var(--surface-2);
}

.day.other-month {
  background: var(--surface-2);
  color: var(--text-3);
}

.day.today {
  background: var(--primary-50);
}

.day.has-events::after {
  content: '';
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--primary-blue);
}

/* Day Content */
.day-number {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-2);
  margin-bottom: var(--space-1);
}

.day-events {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  overflow: hidden;
  flex: 1;
}

/* More Events Indicator */
.more-events {
  font-size: var(--font-size-xs);
  color: var(--text-2);
  background: var(--surface-2);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  text-align: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.more-events:hover {
  background: var(--surface-3);
  color: var(--text-1);
}

/* Responsive Styles */
@media (max-width: 1024px) {
  .day {
    min-height: 100px;
  }
}

@media (max-width: 768px) {
  .weekdays > div {
    font-size: var(--font-size-sm);
  }

  .day {
    min-height: 80px;
    padding: var(--space-1);
  }

  .day-events {
    display: none;
  }

  .day.has-events::after {
    width: 8px;
    height: 8px;
  }
}

@media (max-width: 480px) {
  .month-view {
    height: calc(100vh - 200px);
  }

  .weekdays {
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .days {
    grid-auto-rows: minmax(60px, 1fr);
  }

  .day {
    min-height: 60px;
  }

  .day-number {
    font-size: var(--font-size-xs);
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .day.today {
    background: var(--primary-900);
    color: var(--primary-50);
  }

  .day.other-month {
    background: var(--surface-3);
  }

  .more-events {
    background: var(--surface-3);
  }

  .more-events:hover {
    background: var(--surface-4);
  }

  .day:hover {
    background: var(--surface-3);
  }
}
</style>