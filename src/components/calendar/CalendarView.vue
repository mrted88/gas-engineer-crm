<template>
  <div class="calendar-container">
    <!-- Calendar Header -->
    <div class="calendar-header">
      <div class="calendar-nav">
        <button class="btn btn-secondary" @click="previousMonth">
          <i class="fas fa-chevron-left"></i>
        </button>
        <h2>{{ currentMonthYear }}</h2>
        <button class="btn btn-secondary" @click="nextMonth">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
      <div class="calendar-actions">
        <button 
          v-for="view in views" 
          :key="view"
          class="btn"
          :class="currentView === view ? 'btn-primary' : 'btn-secondary'"
          @click="currentView = view"
        >
          {{ view }}
        </button>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="calendar-grid" :class="currentView">
      <!-- Week View -->
<template v-if="currentView === 'week'">
  <div class="week-view-container">
    <div class="time-column">
      <div class="time-header"></div> <!-- Add this empty header cell -->
      <div v-for="hour in hours" :key="hour" class="time-slot">
        {{ formatHour(hour) }}
      </div>
    </div>
    <div class="week-content">
      <div class="week-header">
        <div 
          v-for="day in currentWeekDays" 
          :key="format(day.date, 'yyyy-MM-dd')"
          class="week-day-header"
          :class="{ today: isToday(day.date) }"
        >
          <span class="day-name">{{ day.dayName }}</span>
          <span class="day-number">{{ day.dayNumber }}</span>
        </div>
      </div>
      <div class="week-body">
        <div 
          v-for="day in currentWeekDays" 
          :key="format(day.date, 'yyyy-MM-dd')"
          class="day-column"
        >
          <div 
            v-for="hour in hours" 
            :key="hour"
            class="hour-slot"
            @click="openNewEventModal(day.date, hour)"
          >
            <template v-for="event in getEventsForDateAndHour(day.date, hour)" :key="event.id">
              <div 
                class="calendar-event"
                :class="event.status"
                :style="getEventStyles(event)"
                @click.stop="openEventDetails(event)"
              >
                {{ event.title }}
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

      <!-- Month View -->
      <template v-else-if="currentView === 'month'">
        <div class="weekdays">
          <div v-for="day in weekDays" :key="day">{{ day }}</div>
        </div>
        <div class="days">
          <div
            v-for="date in calendarDays"
            :key="format(date.date, 'yyyy-MM-dd')"
            class="day"
            :class="{
              'other-month': !date.isCurrentMonth,
              'today': isToday(date.date)
            }"
            @click="selectDate(date)"
          >
            <span class="day-number">{{ date.dayNumber }}</span>
            <div class="day-events">
              <div
                v-for="event in getEventsForDate(date.date)"
                :key="event.id"
                class="calendar-event"
                :class="event.status"
                @click.stop="openEventDetails(event)"
              >
                {{ event.title }}
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Day View -->
      <template v-else-if="currentView === 'day'">
        <div class="day-view">
          <div class="time-column">
            <div v-for="hour in hours" :key="hour" class="time-slot">
              {{ formatHour(hour) }}
            </div>
          </div>
          <div class="day-timeline">
            <div class="day-header">
              <div 
                class="day-title"
                :class="{ today: isToday(currentDate) }"
              >
                {{ format(currentDate, 'EEEE, MMMM d') }}
              </div>
            </div>
            <div class="timeline-events">
              <div 
                v-for="hour in hours" 
                :key="hour"
                class="hour-slot"
                @click="openNewEventModal(currentDate, hour)"
              >
                <template v-for="event in getEventsForDateAndHour(currentDate, hour)" :key="event.id">
                  <div 
                    class="calendar-event"
                    :class="[event.status, 'detailed']"
                    :style="getEventStyles(event)"
                    @click.stop="openEventDetails(event)"
                  >
                    <div class="event-time">{{ format(parseISO(event.startTime), 'h:mm a') }}</div>
                    <div class="event-title">{{ event.title }}</div>
                    <div class="event-customer">{{ getCustomerName(event.customerId) }}</div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Agenda View -->
      <template v-else-if="currentView === 'agenda'">
        <div class="agenda-view">
          <div class="agenda-filters">
            <select v-model="agendaFilter">
              <option value="upcoming">Upcoming</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
          <div class="agenda-list">
            <template v-if="filteredAgendaEvents.length">
              <div 
                v-for="(group, date) in groupedAgendaEvents" 
                :key="date" 
                class="agenda-group"
              >
                <div class="agenda-date">
                  {{ format(parseISO(date), 'EEEE, MMMM d') }}
                </div>
                <div 
                  v-for="event in group" 
                  :key="event.id"
                  class="agenda-event"
                  :class="event.status"
                  @click="openEventDetails(event)"
                >
                  <div class="event-time">
                    {{ format(parseISO(event.startTime), 'h:mm a') }}
                    <span class="event-duration">
                      ({{ formatDuration(event.duration) }})
                    </span>
                  </div>
                  <div class="event-details">
                    <div class="event-title">{{ event.title }}</div>
                    <div class="event-customer">{{ getCustomerName(event.customerId) }}</div>
                  </div>
                  <div class="event-actions">
                    <button 
                      class="btn btn-icon"
                      @click.stop="updateEventStatus(event.id, 'completed')"
                    >
                      ✓
                    </button>
                    <button 
                      class="btn btn-icon"
                      @click.stop="updateEventStatus(event.id, 'cancelled')"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            </template>
            <div v-else class="no-events">
              No events found
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Event Modal -->
    <Modal v-model="showEventModal">
      <template #header>
        <h3>{{ editingEvent ? 'Edit Appointment' : 'New Appointment' }}</h3>
      </template>
      
      <template #default>
        <form @submit.prevent="saveEvent" class="event-form">
          <div class="form-group">
            <label for="eventTitle">Title</label>
            <input
              id="eventTitle"
              v-model="newEvent.title"
              type="text"
              required
            >
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="eventDate">Date</label>
              <Datepicker
                v-model="newEvent.date"
                :format="dateFormat"
                :min-date="new Date()"
              />
            </div>

            <div class="form-group">
              <label for="eventTime">Time</label>
              <select 
                id="eventTime"
                v-model="newEvent.time"
                required
              >
                <option 
                  v-for="time in availableTimes"
                  :key="time.value"
                  :value="time.value"
                >
                  {{ time.label }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="eventDuration">Duration</label>
            <select 
              id="eventDuration"
              v-model="newEvent.duration"
              required
            >
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
            </select>
          </div>

          <div class="form-group">
            <label for="eventCustomer">Customer</label>
            <select 
              id="eventCustomer"
              v-model="newEvent.customerId"
              required
            >
              <option value="">Select a customer</option>
              <option 
                v-for="customer in customers"
                :key="customer.id"
                :value="customer.id"
              >
                {{ customer.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="eventNotes">Notes</label>
            <textarea
              id="eventNotes"
              v-model="newEvent.notes"
              rows="3"
            ></textarea>
          </div>
        </form>
      </template>

      <template #footer>
        <div class="modal-actions">
          <button 
            v-if="editingEvent"
            class="btn btn-danger"
            @click="deleteEvent"
          >
            Delete
          </button>
          <button 
            class="btn btn-secondary"
            @click="showEventModal = false"
          >
            Cancel
          </button>
          <button 
            class="btn btn-primary"
            @click="saveEvent"
          >
            {{ editingEvent ? 'Update' : 'Create' }}
          </button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  isToday as dateFnsIsToday,
  parseISO,
  addHours,
  addDays,
  startOfDay,
  endOfDay,
  isSameDay,
  isBefore,
  isAfter,
  startOfWeek as getStartOfWeek,
  endOfWeek as getEndOfWeek,
  startOfMonth as getStartOfMonth,
  endOfMonth as getEndOfMonth,
  formatDistance
} from 'date-fns'
import type { CSSProperties } from 'vue'
import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import Modal from '@/components/Modal.vue'
import { useCustomersStore } from '@/stores/customers'
import { useEventsStore } from '@/stores/events'
import type { CalendarEvent, NewCalendarEvent } from '@/types/event'

// Store instances
const customersStore = useCustomersStore()
const eventsStore = useEventsStore()

// State
const agendaFilter = ref<'upcoming' | 'today' | 'week' | 'month'>('upcoming')
const currentDate = ref(new Date())
const currentView = ref<'month' | 'week' | 'day' | 'agenda'>('month')
const showEventModal = ref(false)
const editingEvent = ref<CalendarEvent | null>(null)
  const newEvent = ref<NewCalendarEvent>({
  title: '',
  date: new Date(),
  time: '',  // Initialize with empty string instead of undefined
  duration: 60,
  customerId: '',
  notes: ''
})

// Constants
const views = ['month', 'week', 'day', 'agenda'] as const
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const hours = Array.from({ length: 12 }, (_, i) => i + 8) // 8 AM to 7 PM
const dateFormat = 'dd/MM/yyyy'

// Computed Properties
const currentMonthYear = computed(() => {
  return format(currentDate.value, 'MMMM yyyy')
})

const getEventsByDate = computed(() => (date: Date) => {
  return eventsStore.events.filter(event => 
    isSameDay(new Date(event.date), date)
  )
})

const calendarDays = computed(() => {
  const start = startOfWeek(startOfMonth(currentDate.value))
  const end = endOfWeek(endOfMonth(currentDate.value))
  
  return eachDayOfInterval({ start, end }).map(date => ({
    date,
    dayNumber: format(date, 'd'),
    isCurrentMonth: format(date, 'M') === format(currentDate.value, 'M')
  }))
})

const currentWeekDays = computed(() => {
  const start = startOfWeek(currentDate.value)
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(start, i)
    return {
      date,
      dayName: format(date, 'EEE'),
      dayNumber: format(date, 'd')
    }
  })
})

const availableTimes = computed(() => {
  return hours.map(hour => ({
    value: `${hour.toString().padStart(2, '0')}:00`,
    label: format(addHours(startOfDay(new Date()), hour), 'h:mm a')
  }))
})

const customers = computed(() => customersStore.customers)

const filteredAgendaEvents = computed(() => {
  const now = new Date()
  const events = eventsStore.events
  
  switch (agendaFilter.value) {
    case 'today':
      return events.filter(event => 
        isSameDay(new Date(event.date), now)
      )
    case 'week':
      const weekStart = getStartOfWeek(now)
      const weekEnd = getEndOfWeek(now)
      return events.filter(event => {
        const eventDate = new Date(event.date)
        return isAfter(eventDate, weekStart) && isBefore(eventDate, weekEnd)
      })
    case 'month':
      const monthStart = getStartOfMonth(now)
      const monthEnd = getEndOfMonth(now)
      return events.filter(event => {
        const eventDate = new Date(event.date)
        return isAfter(eventDate, monthStart) && isBefore(eventDate, monthEnd)
      })
    default: // upcoming
      return events.filter(event => 
        isAfter(new Date(event.date), now)
      ).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      )
  }
})

const groupedAgendaEvents = computed(() => {
  const grouped: Record<string, CalendarEvent[]> = {}
  
  filteredAgendaEvents.value.forEach(event => {
    const dateKey = format(new Date(event.date), 'yyyy-MM-dd')
    if (!grouped[dateKey]) {
      grouped[dateKey] = []
    }
    grouped[dateKey].push(event)
  })
  
  return grouped
})

// Methods
function previousMonth() {
  currentDate.value = subMonths(currentDate.value, 1)
  fetchEventsForCurrentView()
}

function nextMonth() {
  currentDate.value = addMonths(currentDate.value, 1)
  fetchEventsForCurrentView()
}

function isToday(date: Date) {
  return dateFnsIsToday(date)
}

function formatHour(hour: number) {
  return format(addHours(startOfDay(new Date()), hour), 'h a')
}

function getEventsForDate(date: Date) {
  const events = eventsStore.events.filter(event => 
    isSameDay(new Date(event.date), date)
  )
  console.log('Getting events for date:', date, 'Found:', events)
  return events
}

function getEventsForDateAndHour(date: Date, hour: number) {
  return getEventsForDate(date).filter(event => {
    try {
      if (!event.startTime) return false
      const eventHour = parseInt(event.startTime.split(':')[0])
      return !isNaN(eventHour) && eventHour === hour
    } catch (error) {
      console.error('Error filtering event:', error)
      return false
    }
  })
}

function getEventStyles(event: CalendarEvent): CSSProperties {
  if (!event.time) {
    return {
      height: '100%',
      backgroundColor: getEventColor(event.status),
      position: 'relative' as const
    }
  }

  try {
    const [hours, minutes] = event.time.split(':').map(Number)
    const startMinutes = (hours * 60) + minutes
    const top = (startMinutes % 60) / 60 * 100
    const durationInHours = (event.duration || 60) / 60

    return {
      top: `${top}%`,
      height: `${durationInHours * 100}%`,
      position: 'absolute' as const,
      width: '95%',
      backgroundColor: getEventColor(event.status)
    }
  } catch (error) {
    console.error('Error calculating event styles:', error)
    return {
      height: '100%',
      backgroundColor: getEventColor(event.status),
      position: 'relative' as const
    }
  }
}

function getEventsForDate(date: Date): CalendarEvent[] {
  return eventsStore.events.filter(event => 
    isSameDay(new Date(event.date), date)
  )
}

function getEventsForDateAndHour(date: Date, hour: number): CalendarEvent[] {
  return getEventsForDate(date).filter(event => {
    if (!event.time) return false
    const eventHour = parseInt(event.time.split(':')[0])
    return eventHour === hour
  })
}

function getEventColor(status: CalendarEvent['status']) {
  switch (status) {
    case 'completed':
      return 'var(--success)'
    case 'cancelled':
      return 'var(--error)'
    default:
      return 'var(--primary-blue)'
  }
}

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes 
    ? `${hours}h ${remainingMinutes}m` 
    : `${hours}h`
}

function selectDate(date: { date: Date }) {
  openNewEventModal(date.date)
}

function openEventDetails(event: CalendarEvent) {
  editingEvent.value = event
  newEvent.value = {
    title: event.title,
    date: new Date(event.date),
    time: event.startTime,
    duration: event.duration,
    customerId: event.customerId,
    notes: event.notes || ''
  }
  showEventModal.value = true
}

function openNewEventModal(date: Date, hour?: number) {
  console.log('Available customers:', customers.value)  // Add this line here
  editingEvent.value = null
  newEvent.value = {
    title: '',
    date,
    time: hour ? `${hour.toString().padStart(2, '0')}:00` : '09:00',
    duration: 60,
    customerId: '',
    notes: ''
  }
  showEventModal.value = true
}

function combineDateAndTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number)
  const result = new Date(date)
  result.setHours(hours, minutes, 0, 0)
  return result
}

async function saveEvent() {
  try {
    const eventData = {
      ...newEvent.value,
      date: combineDateAndTime(newEvent.value.date, newEvent.value.time),
      startTime: newEvent.value.time, // Should be in "HH:mm" format
      duration: newEvent.value.duration || 60
    }
    console.log('About to save event with data:', eventData)

    if (editingEvent.value) {
      await eventsStore.updateEvent(editingEvent.value.id, eventData)
    } else {
      const createdEvent = await eventsStore.createEvent(eventData)
      console.log('Event created:', createdEvent)
    }
    showEventModal.value = false
    await fetchEventsForCurrentView()
  } catch (error) {
    console.error('Failed to save event:', error)
  }
}

async function deleteEvent() {
  if (!editingEvent.value) return
  
  try {
    await eventsStore.deleteEvent(editingEvent.value.id)
    showEventModal.value = false
    await fetchEventsForCurrentView()
  } catch (error) {
    console.error('Failed to delete event:', error)
  }
}

function getCustomerName(customerId: string): string {
  const customer = customersStore.customers.find(c => c.id === customerId)
  return customer?.name || 'Unknown Customer'
}

async function updateEventStatus(eventId: string, status: CalendarEvent['status']) {
  try {
    await eventsStore.updateEventStatus(eventId, status)
    await fetchEventsForCurrentView()
  } catch (error) {
    console.error('Failed to update event status:', error)
  }
}

async function fetchEventsForCurrentView(): Promise<void> {
  const start = currentView.value === 'month' 
    ? startOfMonth(currentDate.value)
    : startOfWeek(currentDate.value)
  
  const end = currentView.value === 'month'
    ? endOfMonth(currentDate.value)
    : endOfWeek(currentDate.value)

  await eventsStore.fetchEvents({
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd')
  })
}

// Lifecycle
onMounted(async () => {
  console.log('Calendar component mounting...')
  try {
    await Promise.all([
      customersStore.fetchCustomers(),
      fetchEventsForCurrentView()
    ])
    console.log('After fetch - Customers:', customersStore.customers)
  } catch (error) {
    console.error('Error in calendar mount:', error)
  }
})
</script>

<style scoped>
.calendar-container {
  background: var(--surface-1);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-1);
  padding: var(--space-4);
  height: calc(100vh - 12rem);
  display: flex;
  flex-direction: column;
}

/* Calendar Header */
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
  padding: var(--space-2);
}

.calendar-nav {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.calendar-nav h2 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin: 0;
  min-width: 200px;
  text-align: center;
}

.calendar-actions {
  display: flex;
  gap: var(--space-2);
}

/* Calendar Grid */
.calendar-grid {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-weight: 500;
  color: var(--text-2);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: var(--space-2);
}

.days {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: var(--border-color);
  border: 1px solid var(--border-color);
}

.day {
  background: var(--surface-1);
  min-height: 100px;
  padding: var(--space-2);
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.day:hover {
  background: var(--surface-2);
}

.day.other-month {
  background: var(--surface-2);
  color: var(--text-3);
}

.day.today {
  background: var(--primary-1);
}

.day-number {
  font-weight: 500;
  margin-bottom: var(--space-2);
}

.day-events {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  overflow-y: auto;
}

/* Week View */
.week-view-container {
  display: flex;
  flex: 1;
  overflow: hidden;
  height: 100%;
  background: var(--surface-1);
}

.time-column {
  width: 60px;
  flex-shrink: 0;
  border-right: 1px solid var(--border-color);
  background: var(--surface-1);
  z-index: 2;
}

.time-header {
  height: 50px; /* Match the header height */
  border-bottom: 1px solid var(--border-color);
}

.time-slot {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-2);
  font-size: var(--font-size-sm);
}

.week-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.week-header {
  height: 50px;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 1px solid var(--border-color);
  background: var(--surface-1);
  z-index: 1;
}

.week-day-header {
  padding: var(--space-2);
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
}

.week-body {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  overflow-y: auto;
  position: relative;
}

.day-column {
  border-right: 1px solid var(--border-color);
}

.hour-slot {
  height: 60px;
  border-bottom: 1px solid var(--border-color);
  position: relative;
}

/* Calendar Events in Week View */
.calendar-event {
  position: absolute;
  left: 2px;
  right: 2px;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  overflow: hidden;
  cursor: pointer;
  z-index: 1;
}

/* Day View */
.day-view {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.day-timeline {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.day-header {
  padding: var(--space-2);
  border-bottom: 1px solid var(--border-color);
}

.day-title {
  font-weight: 600;
  text-align: center;
}

.day-title.today {
  color: var(--primary);
}

.timeline-events {
  flex: 1;
  overflow-y: auto;
}

/* Agenda View */
.agenda-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.agenda-filters {
  padding: var(--space-4);
  border-bottom: 1px solid var(--border-color);
}

.agenda-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);
}

.agenda-group {
  margin-bottom: var(--space-6);
}

.agenda-date {
  font-weight: 600;
  margin-bottom: var(--space-2);
  color: var(--text-2);
}

.agenda-event {
  display: flex;
  align-items: center;
  padding: var(--space-3);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-2);
  background: var(--surface-2);
}

/* Calendar Events */
.calendar-event {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  background: var(--primary-blue);
  color: white;
  font-size: var(--font-size-sm);
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.calendar-event.completed {
  background: var(--success);
}

.calendar-event.cancelled {
  background: var(--error);
}

.calendar-event.detailed {
  padding: var(--space-2);
}

.event-time {
  font-weight: 500;
  margin-bottom: var(--space-1);
}

.event-title {
  margin-bottom: var(--space-1);
}

.event-customer {
  font-size: var(--font-size-sm);
  opacity: 0.8;
}

.event-duration {
  color: var(--text-2);
  font-size: var(--font-size-sm);
}

.event-details {
  flex: 1;
}

.event-actions {
  display: flex;
  gap: var(--space-2);
}

/* Form Styles */
.event-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-group label {
  font-weight: 500;
  color: var(--text-2);
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: var(--space-2);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--surface-1);
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.modal-actions {
  display: flex;
  gap: var(--space-2);
  justify-content: flex-end;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .calendar-header {
    flex-direction: column;
    gap: var(--space-4);
  }

  .calendar-nav h2 {
    min-width: 150px;
    font-size: var(--font-size-base);
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .day {
    min-height: 80px;
  }

  .calendar-event {
    font-size: var(--font-size-xs);
  }
}
</style>