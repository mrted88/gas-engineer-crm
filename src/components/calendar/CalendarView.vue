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

    <!-- Loading and Error States -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      Loading calendar...
    </div>
    
    <div v-else-if="error" class="error-state">
      <p>{{ error.message }}</p>
      <button class="btn btn-primary" @click="fetchEventsForCurrentView">
        Retry
      </button>
    </div>

    <!-- Calendar Grid -->
    <div v-else class="calendar-grid" :class="currentView">
      <!-- Week View -->
      <template v-if="currentView === 'week'">
        <div class="week-view-container">
          <div class="time-column">
            <div class="time-header"></div>
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
                      <div class="event-time">{{ formatEventTime(event.startTime || event.time) }}</div>
                      <div class="event-title">{{ event.title }}</div>
                      <div class="event-customer">{{ event.customerName }}</div>
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
                <div class="event-time">
                  {{ formatEventTime(event.time) }}
                </div>
                <div class="event-title">{{ event.title }}</div>
                <div class="event-customer">{{ event.customerName }}</div>
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
                    <div class="event-time">
                      {{ formatEventTime(event.time) }}
                    </div>
                    <div class="event-title">{{ event.title }}</div>
                    <div class="event-customer">{{ event.customerName }}</div>
                    <div class="event-duration">
                      {{ formatDuration(event.duration) }}
                    </div>
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
            <select v-model="agendaFilter" class="filter-select">
              <option value="upcoming">Upcoming</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
          <div class="agenda-list">
            <template v-if="Object.keys(groupedAgendaEvents).length">
              <div 
                v-for="(events, date) in groupedAgendaEvents" 
                :key="date" 
                class="agenda-group"
              >
                <div class="agenda-date">
                  {{ format(parseISO(date), 'EEEE, MMMM d') }}
                </div>
                <div 
                  v-for="event in events" 
                  :key="event.id"
                  class="agenda-event"
                  :class="event.status"
                  @click="openEventDetails(event)"
                >
                  <div class="event-time">
                    {{ formatEventTime(event.time) }}
                    <span class="event-duration">
                      ({{ formatDuration(event.duration) }})
                    </span>
                  </div>
                  <div class="event-details">
                    <div class="event-title">{{ event.title }}</div>
                    <div class="event-customer">{{ event.customerName }}</div>
                  </div>
                  <div class="event-actions">
                    <button 
                      class="btn btn-icon"
                      @click.stop="updateEventStatus(event.id, 'completed')"
                      :disabled="event.status === 'completed'"
                    >
                      <i class="fas fa-check"></i>
                    </button>
                    <button 
                      class="btn btn-icon"
                      @click.stop="updateEventStatus(event.id, 'cancelled')"
                      :disabled="event.status === 'cancelled'"
                    >
                      <i class="fas fa-times"></i>
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
              placeholder="Enter appointment title"
            >
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="eventDate">Date</label>
              <Datepicker
                v-model="newEvent.date"
                :format="dateFormat"
                :min-date="new Date()"
                :enable-time-picker="false"
                auto-apply
                required
              />
            </div>

            <div class="form-group">
              <label for="eventTime">Time</label>
              <select 
                id="eventTime"
                v-model="newEvent.time"
                required
              >
                <option value="">Select time</option>
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
              <option value="180">3 hours</option>
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
              placeholder="Add any additional notes here"
            ></textarea>
          </div>

          <div v-if="formError" class="form-error">
            {{ formError }}
          </div>
        </form>
      </template>

      <template #footer>
        <div class="modal-actions">
          <button 
            v-if="editingEvent"
            class="btn btn-danger"
            type="button"
            @click="confirmDelete"
          >
            Delete
          </button>
          <button 
            class="btn btn-secondary"
            type="button"
            @click="closeEventModal"
          >
            Cancel
          </button>
          <button 
            class="btn btn-primary"
            type="submit"
            @click="saveEvent"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Saving...' : (editingEvent ? 'Update' : 'Create') }}
          </button>
        </div>
      </template>
    </Modal>

     <!-- Delete Confirmation Modal -->
 <Modal 
   v-model="showDeleteModal"
   title="Confirm Delete"
>
   <template #default>
     <p>Are you sure you want to delete this appointment? This action cannot be undone.</p>
   </template>

   <template #footer>
     <div class="modal-actions">
       <button 
         class="btn btn-secondary"
         @click="showDeleteModal = false"
       >
         Cancel
       </button>
       <button 
         class="btn btn-danger"
         @click="handleDelete"
         :disabled="isDeleting"
       >
         {{ isDeleting ? 'Deleting...' : 'Delete' }}
       </button>
     </div>
   </template>
 </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
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
  isWithinInterval,
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
import type { 
  CalendarEvent, 
  NewCalendarEvent, 
  EventStatus,
  EventFilters 
} from '@/types/event'

// Store instances
const customersStore = useCustomersStore()
const eventsStore = useEventsStore()
const router = useRouter()

// State
const error = ref<Error | null>(null)
const formError = ref<string | null>(null)
const isLoading = ref(false)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const agendaFilter = ref<'upcoming' | 'today' | 'week' | 'month'>('upcoming')
const currentDate = ref(new Date())
const currentView = ref<'month' | 'week' | 'day' | 'agenda'>('month')
const showEventModal = ref(false)
const showDeleteModal = ref(false)
const editingEvent = ref<CalendarEvent | null>(null)
const newEvent = ref<NewCalendarEvent>({
  title: '',
  date: new Date(),
  time: '',
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

const filteredEvents = computed(() => {
  return eventsStore.events.filter(event => {
    const eventDate = new Date(event.date)
    return isWithinInterval(eventDate, {
      start: startOfMonth(currentDate.value),
      end: endOfMonth(currentDate.value)
    })
  })
})

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
      return events
        .filter(event => isAfter(new Date(event.date), now))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
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

// Utility Functions
function formatHour(hour: number): string {
  return format(addHours(startOfDay(new Date()), hour), 'h a')
}

function formatEventTime(time: string): string {
  if (!time) return ''
  try {
    // Handle both HH:mm and ISO formats
    if (time.includes('T')) {
      return format(parseISO(time), 'h:mm a')
    }
    const [hours, minutes] = time.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    return format(date, 'h:mm a')
  } catch (error) {
    console.error('Error formatting time:', error)
    return time
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

function getEventStyles(event: CalendarEvent): CSSProperties {
  const time = event.startTime || event.time
  if (!time) {
    return {
      height: '100%',
      backgroundColor: getEventColor(event.status),
      position: 'relative'
    }
  }

  try {
    const [hours, minutes] = time.split(':').map(Number)
    if (isNaN(hours) || isNaN(minutes)) throw new Error('Invalid time format')
    
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

function getEventColor(status: EventStatus): string {
  switch (status) {
    case 'completed':
      return 'var(--success)'
    case 'cancelled':
      return 'var(--error)'
    default:
      return 'var(--primary-blue)'
  }
}

function isToday(date: Date): boolean {
  return dateFnsIsToday(date)
}

function combineDateAndTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number)
  const result = new Date(date)
  result.setHours(hours, minutes, 0, 0)
  return result
}

// Event Handlers
function getEventsForDate(date: Date): CalendarEvent[] {
  return eventsStore.events.filter(event => 
    isSameDay(new Date(event.date), date)
  )
}

function getEventsForDateAndHour(date: Date, hour: number): CalendarEvent[] {
  return getEventsForDate(date).filter(event => {
    if (!event.time && !event.startTime) return false
    try {
      const timeStr = event.startTime || event.time
      const [eventHour] = timeStr.split(':').map(Number)
      return !isNaN(eventHour) && eventHour === hour
    } catch (error) {
      console.error('Error parsing event time:', error)
      return false
    }
  })
}

function previousMonth(): void {
  currentDate.value = subMonths(currentDate.value, 1)
  fetchEventsForCurrentView()
}

function nextMonth(): void {
  currentDate.value = addMonths(currentDate.value, 1)
  fetchEventsForCurrentView()
}

function selectDate(date: { date: Date }): void {
  openNewEventModal(date.date)
}

function openEventDetails(event: CalendarEvent): void {
  router.push(`/jobs/${event.id}`)
}

function openNewEventModal(date: Date, hour?: number): void {
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

function closeEventModal(): void {
  showEventModal.value = false
  editingEvent.value = null
  formError.value = null
  newEvent.value = {
    title: '',
    date: new Date(),
    time: '',
    duration: 60,
    customerId: '',
    notes: ''
  }
}

async function saveEvent(): Promise<void> {
  try {
    isSubmitting.value = true
    formError.value = null

    const eventData = {
      title: newEvent.value.title,
      date: combineDateAndTime(newEvent.value.date, newEvent.value.time),
      time: newEvent.value.time,
      startTime: newEvent.value.time,
      duration: newEvent.value.duration,
      customerId: newEvent.value.customerId,
      notes: newEvent.value.notes,
      status: 'scheduled' as const,
      customerName: customers.value.find(c => c.id === newEvent.value.customerId)?.name || 'Unknown',
    }

    if (editingEvent.value) {
      await eventsStore.updateEvent(editingEvent.value.id, {
        ...eventData,
        updatedAt: new Date().toISOString()
      })
    } else {
      await eventsStore.createEvent({
        ...eventData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }

    closeEventModal()
    await fetchEventsForCurrentView()
  } catch (error) {
    console.error('Failed to save event:', error)
    formError.value = error instanceof Error ? error.message : 'Failed to save event'
  } finally {
    isSubmitting.value = false
  }
}

function confirmDelete(): void {
  showDeleteModal.value = true
}

async function handleDelete(): Promise<void> {
  if (!editingEvent.value) return

  try {
    isDeleting.value = true
    await eventsStore.deleteEvent(editingEvent.value.id)
    showDeleteModal.value = false
    closeEventModal()
    await fetchEventsForCurrentView()
  } catch (error) {
    console.error('Failed to delete event:', error)
    formError.value = error instanceof Error ? error.message : 'Failed to delete event'
  } finally {
    isDeleting.value = false
  }
}

async function updateEventStatus(eventId: string, status: EventStatus): Promise<void> {
  try {
    await eventsStore.updateEventStatus(eventId, status)
    await fetchEventsForCurrentView()
  } catch (error) {
    console.error('Failed to update event status:', error)
  }
}

async function fetchEventsForCurrentView(): Promise<void> {
  try {
    isLoading.value = true
    error.value = null
    
    const start = currentView.value === 'month' 
      ? startOfMonth(currentDate.value)
      : startOfWeek(currentDate.value)
    
    const end = currentView.value === 'month'
      ? endOfMonth(currentDate.value)
      : endOfWeek(currentDate.value)

    const filters: EventFilters = {
      start: format(start, 'yyyy-MM-dd'),
      end: format(end, 'yyyy-MM-dd')
    }

    await eventsStore.fetchEvents(filters)
  } catch (err) {
    console.error('Error fetching events:', err)
    error.value = err instanceof Error ? err : new Error('Failed to fetch events')
  } finally {
    isLoading.value = false
  }
}

// Lifecycle Hooks
onMounted(async () => {
  console.log('Calendar component mounting...')
  try {
    await Promise.all([
      customersStore.fetchCustomers(),
      fetchEventsForCurrentView()
    ])
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

/* Loading and Error States */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: var(--space-4);
  color: var(--text-2);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color);
  border-top-color: var(--primary-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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
  background: var(--surface-2);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-weight: 500;
  color: var(--text-2);
  background: var(--surface-1);
  padding: var(--space-3);
  border-bottom: 1px solid var(--border-color);
}

.days {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: var(--border-color);
  padding: 1px;
}

.day {
  background: var(--surface-1);
  min-height: 100px;
  padding: var(--space-2);
  cursor: pointer;
  display: flex;
  flex-direction: column;
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
}

.week-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.week-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: var(--surface-1);
  border-bottom: 1px solid var(--border-color);
}

.week-day-header {
  padding: var(--space-2);
  text-align: center;
  border-right: 1px solid var(--border-color);
}

.week-body {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  overflow-y: auto;
}

.hour-slot {
  height: 60px;
  border-bottom: 1px solid var(--border-color);
  position: relative;
}

/* Calendar Events */
.calendar-event {
  padding: var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative;
  z-index: 1;
}

.calendar-event:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-2);
}

.calendar-event.detailed {
  padding: var(--space-3);
}

.event-time {
  font-weight: 500;
  margin-bottom: var(--space-1);
}

.event-title {
  font-weight: 500;
  margin-bottom: var(--space-1);
}

.event-customer {
  font-size: var(--font-size-sm);
  opacity: 0.8;
}

/* Agenda View */
.agenda-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.agenda-filters {
  padding: var(--space-4);
  border-bottom: 1px solid var(--border-color);
}

.filter-select {
  width: 200px;
  padding: var(--space-2);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--surface-1);
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
  margin-bottom: var(--space-3);
  color: var(--text-2);
}

.agenda-event {
  display: flex;
  align-items: center;
  padding: var(--space-3);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-2);
  background: var(--surface-1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.agenda-event:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-2);
}

.event-details {
  flex: 1;
  margin: 0 var(--space-4);
}

.event-actions {
  display: flex;
  gap: var(--space-2);
}

/* Modal Styles */
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

.form-error {
  color: var(--error);
  font-size: var(--font-size-sm);
  margin-top: var(--space-2);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
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
}

@media (max-width: 480px) {
  .calendar-container {
    padding: var(--space-2);
  }

  .day {
    min-height: 80px;
    font-size: var(--font-size-sm);
  }

  .calendar-event {
    font-size: var(--font-size-xs);
  }

  .agenda-event {
    flex-direction: column;
    gap: var(--space-2);
  }

  .event-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>