<template>
  <div class="calendar-container">
    <!-- Calendar Header -->
    <div class="calendar-header">
      <div class="calendar-nav">
        <button class="nav-button" @click="handleNavigation('previous')">
          <i class="fas fa-chevron-left"></i>
        </button>
        <h2>{{ currentMonthYear }}</h2>
        <button class="nav-button" @click="handleNavigation('next')">
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

    <!-- Calendar Grid with all views -->
    <div v-else class="calendar-grid" :class="currentView">
      <!-- Week View -->
      <template v-if="currentView === 'week'">
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
                v-for="day in currentWeekDays" 
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
                v-for="(day, index) in currentWeekDays" 
                :key="format(day.date, 'yyyy-MM-dd')"
                class="day-column"
                @dragover.prevent
                @drop="(e) => handleDrop(e, day.date, hour)"
              >
                <div 
                  v-for="hour in hours" 
                  :key="hour"
                  class="hour-slot"
                  :class="{
                    'unavailable': !isTimeSlotAvailable(day.date, hour),
                    'has-conflict': hasTimeSlotConflict(day.date, hour)
                  }"
                  @click="openNewEventModal(day.date, hour)"
                >
                  <template 
                    v-for="event in getEventsForDateAndHour(day.date, hour)" 
                    :key="event.id"
                  >
                    <div 
                      class="calendar-event"
                      :class="[
                        event.status,
                        { 'is-dragging': isDragging && draggedEvent?.id === event.id },
                        { 'is-recurring': isRecurringEvent(event) }
                      ]"
                      :style="getEventStyles(event)"
                      @click.stop="openEventDetails(event)"
                      draggable="true"
                      @dragstart="handleDragStart($event, event)"
                      @dragend="handleDragEnd"
                    >
                      <div class="event-time">
                        {{ formatEventTime(event.startTime || event.time) }}
                      </div>
                      <div class="event-title">{{ event.title }}</div>
                      <div class="event-customer">{{ event.customerName }}</div>
                      <div class="event-status-indicator" :class="event.status"></div>
                      <div v-if="isRecurringEvent(event)" class="recurring-indicator">
                        <i class="fas fa-sync-alt"></i>
                      </div>
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
        <div class="month-view">
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
                'today': isToday(date.date),
                'has-events': hasEvents(date.date)
              }"
              @click="openNewEventModal(date.date)"
            >
              <span class="day-number">{{ date.dayNumber }}</span>
              <div class="day-events">
                <div
                  v-for="event in getEventsForDate(date.date)"
                  :key="event.id"
                  class="calendar-event"
                  :class="[
                    event.status,
                    { 'is-recurring': isRecurringEvent(event) }
                  ]"
                  @click.stop="openEventDetails(event)"
                >
                  <div class="event-time">{{ formatEventTime(event.time) }}</div>
                  <div class="event-title">{{ event.title }}</div>
                  <div v-if="isRecurringEvent(event)" class="recurring-indicator">
                    <i class="fas fa-sync-alt"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Day View -->
      <template v-else-if="currentView === 'day'">
        <div class="day-view">
          <!-- Similar structure to week view but for a single day -->
        </div>
      </template>

      <!-- Agenda View -->
      <template v-else-if="currentView === 'agenda'">
        <div class="agenda-view">
          <!-- Agenda implementation -->
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
          <!-- Title -->
          <div class="form-group">
            <label for="eventTitle">Title</label>
            <input
              id="eventTitle"
              v-model="newEvent.title"
              type="text"
              required
              placeholder="Enter appointment title"
              class="form-input"
            >
          </div>

          <!-- Date and Time -->
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
                class="date-picker"
                @update:modelValue="handleDateChange"
              />
            </div>

            <div class="form-group">
              <label for="eventTime">Time</label>
              <select 
                id="eventTime"
                v-model="newEvent.time"
                required
                class="form-select"
                @change="handleTimeChange"
              >
                <option value="">Select time</option>
                <option 
                  v-for="slot in availableTimeSlots"
                  :key="slot.start"
                  :value="slot.start"
                  :disabled="!slot.available"
                >
                  {{ formatTimeSlot(slot) }}
                </option>
              </select>
            </div>
          </div>

          <!-- Duration -->
          <div class="form-group">
            <label for="eventDuration">Duration</label>
            <select 
              id="eventDuration"
              v-model="newEvent.duration"
              required
              class="form-select"
              @change="handleDurationChange"
            >
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
              <option value="180">3 hours</option>
              <option value="240">4 hours</option>
            </select>
          </div>

          <!-- Customer Selection -->
          <div class="form-group">
            <label for="eventCustomer">Customer</label>
            <select 
              id="eventCustomer"
              v-model="newEvent.customerId"
              required
              class="form-select"
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

          <!-- Recurrence (Optional) -->
          <div class="form-group" v-if="!editingEvent">
            <label>
              <input 
                type="checkbox" 
                v-model="isRecurring"
              > Make this a recurring appointment
            </label>
            
            <div v-if="isRecurring" class="recurrence-options">
              <select 
                v-model="recurrencePattern.frequency"
                class="form-select"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
              
              <div class="recurrence-end">
                <label>
                  <input 
                    type="radio" 
                    v-model="recurrenceEndType"
                    value="date"
                  > End by date
                </label>
                <Datepicker
                  v-if="recurrenceEndType === 'date'"
                  v-model="recurrencePattern.endDate"
                  :min-date="newEvent.date"
                  :format="dateFormat"
                  auto-apply
                />
                
                <label>
                  <input 
                    type="radio" 
                    v-model="recurrenceEndType"
                    value="occurrences"
                  > End after occurrences
                </label>
                <input
                  v-if="recurrenceEndType === 'occurrences'"
                  type="number"
                  v-model="recurrencePattern.endAfterOccurrences"
                  min="1"
                  max="52"
                  class="form-input"
                />
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div class="form-group">
            <label for="eventNotes">Notes</label>
            <textarea
              id="eventNotes"
              v-model="newEvent.notes"
              rows="3"
              placeholder="Add any additional notes here"
              class="form-textarea"
            ></textarea>
          </div>

          <!-- Status (for editing) -->
          <div class="form-group" v-if="editingEvent">
            <label for="eventStatus">Status</label>
            <select 
              id="eventStatus"
              v-model="newEvent.status"
              class="form-select"
            >
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <!-- Validation Errors -->
          <div v-if="formError" class="form-error">
            {{ formError }}
          </div>
          
          <!-- Conflict Warning -->
          <div v-if="hasConflict" class="conflict-warning">
            <i class="fas fa-exclamation-triangle"></i>
            Warning: This time slot conflicts with existing appointments
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
            :disabled="isSubmitting || hasConflict"
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
        <div v-if="isRecurringEvent(editingEvent)" class="recurring-delete-options">
          <label>
            <input 
              type="radio" 
              v-model="deleteRecurringOption"
              value="single"
            > Delete only this occurrence
          </label>
          <label>
            <input 
              type="radio" 
              v-model="deleteRecurringOption"
              value="future"
            > Delete this and future occurrences
          </label>
          <label>
            <input 
              type="radio" 
              v-model="deleteRecurringOption"
              value="all"
            > Delete all occurrences
          </label>
        </div>
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
import { ref, computed, watch, onMounted } from 'vue'
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
  subDays,
  startOfDay,
  endOfDay,
  isSameDay,
  isSameMonth,
  isBefore,
  isAfter,
  isWithinInterval,
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
  UpdateCalendarEvent, 
  EventStatus,
  EventFilters,
  TimeSlot,
  EventConflict,
  EventRecurrence,
  RecurringEvent,
  EventValidation
} from '@/types/event'

// Store instances
const router = useRouter()
const customersStore = useCustomersStore()
const eventsStore = useEventsStore()

// State
const error = ref<Error | null>(null)
const formError = ref<string | null>(null)
const isLoading = ref(false)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const isDragging = ref(false)
const draggedEvent = ref<CalendarEvent | null>(null)
const currentDate = ref(new Date())
const currentView = ref<'month' | 'week' | 'day' | 'agenda'>('week')
const showEventModal = ref(false)
const showDeleteModal = ref(false)
const editingEvent = ref<CalendarEvent | null>(null)
const hasConflict = ref(false)
const availableTimeSlots = ref<TimeSlot[]>([])
const deleteRecurringOption = ref<'single' | 'future' | 'all'>('single')
const recurrenceEndType = ref<'date' | 'occurrences'>('date')

const newEvent = ref<NewCalendarEvent>({
  title: '',
  date: new Date(),
  time: '',
  duration: 60,
  customerId: '',
  notes: ''
})

const recurrencePattern = ref<EventRecurrence>({
  frequency: 'weekly',
  interval: 1,
  endDate: undefined,
  endAfterOccurrences: undefined
})

// Constants
const views = ['month', 'week', 'day', 'agenda'] as const
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const hours = Array.from({ length: 12 }, (_, i) => i + 8) // 8 AM to 7 PM
const dateFormat = 'dd/MM/yyyy'

// Computed Properties
const currentMonthYear = computed(() => {
  switch (currentView.value) {
    case 'month':
      return format(currentDate.value, 'MMMM yyyy')
    case 'week':
      const weekStart = startOfWeek(currentDate.value)
      const weekEnd = endOfWeek(currentDate.value)
      return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
    case 'day':
      return format(currentDate.value, 'EEEE, MMMM d, yyyy')
    default:
      return format(currentDate.value, 'MMMM yyyy')
  }
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

const calendarDays = computed(() => {
  const start = startOfWeek(startOfMonth(currentDate.value))
  const end = endOfWeek(endOfMonth(currentDate.value))
  
  return eachDayOfInterval({ start, end }).map(date => ({
    date,
    dayNumber: format(date, 'd'),
    isCurrentMonth: isSameMonth(date, currentDate.value)
  }))
})

const availableTimes = computed(() => {
  return hours.map(hour => ({
    value: `${hour.toString().padStart(2, '0')}:00`,
    label: format(addHours(startOfDay(new Date()), hour), 'h:mm a')
  }))
})

const customers = computed(() => customersStore.customers)

// Event Handlers
function getEventsForDate(date: Date): CalendarEvent[] {
  return eventsStore.events.filter(event => 
    isSameDay(new Date(event.date), date)
  )
}

function getEventsForDateAndHour(date: Date, hour: number): CalendarEvent[] {
  return getEventsForDate(date).filter(event => {
    if (!event.time) return false
    try {
      const [eventHour] = event.time.split(':').map(Number)
      return eventHour === hour
    } catch (error) {
      console.error('Error parsing event time:', error, event)
      return false
    }
  })
}

// Availability and Conflict Checking
async function checkAvailability(date: Date): Promise<void> {
  try {
    const response = await eventsStore.checkAvailability({
      date: format(date, 'yyyy-MM-dd'),
      timeSlots: hours.map(hour => ({
        start: `${hour.toString().padStart(2, '0')}:00`,
        end: `${(hour + 1).toString().padStart(2, '0')}:00`,
        available: true
      }))
    })
    availableTimeSlots.value = response.timeSlots
  } catch (error) {
    console.error('Failed to check availability:', error)
    availableTimeSlots.value = []
  }
}

async function checkConflicts(): Promise<void> {
  if (!newEvent.value.date || !newEvent.value.time) return

  try {
    const conflict = await eventsStore.checkConflicts({
      date: format(newEvent.value.date, 'yyyy-MM-dd'),
      time: newEvent.value.time,
      duration: newEvent.value.duration,
      excludeEventId: editingEvent.value?.id
    })
    hasConflict.value = conflict.exists
  } catch (error) {
    console.error('Failed to check conflicts:', error)
    hasConflict.value = false
  }
}

function isTimeSlotAvailable(date: Date, hour: number): boolean {
  const timeSlot = availableTimeSlots.value.find(slot => {
    const slotHour = parseInt(slot.start.split(':')[0])
    return slotHour === hour
  })
  return timeSlot?.available ?? true
}

function hasTimeSlotConflict(date: Date, hour: number): boolean {
  if (!isSameDay(date, newEvent.value.date)) return false
  if (parseInt(newEvent.value.time.split(':')[0]) !== hour) return false
  return hasConflict.value
}

// Recurring Event Helpers
function isRecurringEvent(event: CalendarEvent | null): event is RecurringEvent {
  return event !== null && 'recurrence' in event
}

// Event Validation
function validateEvent(): EventValidation {
  const errors: string[] = []

  if (!newEvent.value.title.trim()) {
    errors.push('Title is required')
  }

  if (!newEvent.value.date) {
    errors.push('Date is required')
  }

  if (!newEvent.value.time) {
    errors.push('Time is required')
  }

  if (!newEvent.value.customerId) {
    errors.push('Customer is required')
  }

  if (hasConflict.value) {
    errors.push('Time slot has conflicts with existing appointments')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Drag and Drop Handlers
function handleDragStart(e: DragEvent, event: CalendarEvent) {
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

async function handleDrop(e: DragEvent, date: Date, hour: number) {
  e.preventDefault()
  const eventId = e.dataTransfer?.getData('text/plain')
  if (!eventId || !draggedEvent.value) return

  const newTime = `${hour.toString().padStart(2, '0')}:00`
  
  // Check for conflicts before updating
  const conflict = await eventsStore.checkConflicts({
    date: format(date, 'yyyy-MM-dd'),
    time: newTime,
    duration: draggedEvent.value.duration,
    excludeEventId: eventId
  })

  if (conflict.exists) {
    alert('Cannot move event: Time slot conflicts with existing appointments')
    return
  }

  await updateEventDateTime(eventId, date, newTime)
}

async function updateEventDateTime(eventId: string, newDate: Date, newTime: string) {
  try {
    const updateData: UpdateCalendarEvent = {
      date: newDate,
      time: newTime,
      startTime: newTime,
      updatedAt: new Date().toISOString()
    }
    
    await eventsStore.updateEvent(eventId, updateData)
    await fetchEventsForCurrentView()
  } catch (error) {
    console.error('Failed to update event:', error)
  }
}

// Navigation and View Handlers
function handleNavigation(direction: 'previous' | 'next'): void {
  switch (currentView.value) {
    case 'month':
      currentDate.value = direction === 'previous' 
        ? subMonths(currentDate.value, 1)
        : addMonths(currentDate.value, 1)
      break
    case 'week':
      currentDate.value = direction === 'previous'
        ? subDays(currentDate.value, 7)
        : addDays(currentDate.value, 7)
      break
    case 'day':
      currentDate.value = direction === 'previous'
        ? subDays(currentDate.value, 1)
        : addDays(currentDate.value, 1)
      break
  }
}

// Event Modal Handlers
function openEventDetails(event: CalendarEvent): void {
  event.stopPropagation?.()
  router.push(`/jobs/${event.id}`)
}

async function openNewEventModal(date: Date, hour?: number): Promise<void> {
  editingEvent.value = null
  newEvent.value = {
    title: '',
    date,
    time: hour ? `${hour.toString().padStart(2, '0')}:00` : '09:00',
    duration: 60,
    customerId: '',
    notes: ''
  }
  
  await checkAvailability(date)
  await checkConflicts()
  showEventModal.value = true
}

function closeEventModal(): void {
  showEventModal.value = false
  editingEvent.value = null
  hasConflict.value = false
  newEvent.value = {
    title: '',
    date: new Date(),
    time: '',
    duration: 60,
    customerId: '',
    notes: ''
  }
  formError.value = null
  recurrencePattern.value = {
    frequency: 'weekly',
    interval: 1,
    endDate: undefined,
    endAfterOccurrences: undefined
  }
}

function confirmDelete(): void {
  showDeleteModal.value = true
}

async function handleDelete(): Promise<void> {
  if (!editingEvent.value) return

  try {
    isDeleting.value = true
    
    if (isRecurringEvent(editingEvent.value)) {
      await eventsStore.deleteRecurringEvent(
        editingEvent.value.id,
        deleteRecurringOption.value
      )
    } else {
      await eventsStore.deleteEvent(editingEvent.value.id)
    }
    
    showDeleteModal.value = false
    closeEventModal()
    await fetchEventsForCurrentView()
  } catch (error) {
    console.error('Failed to delete event:', error)
  } finally {
    isDeleting.value = false
  }
}

async function saveEvent(): Promise<void> {
  try {
    const validation = validateEvent()
    if (!validation.isValid) {
      formError.value = validation.errors.join('\n')
      return
    }

    isSubmitting.value = true
    formError.value = null

    const eventData: NewCalendarEvent = {
      title: newEvent.value.title,
      date: newEvent.value.date,
      time: newEvent.value.time,
      duration: newEvent.value.duration,
      customerId: newEvent.value.customerId,
      notes: newEvent.value.notes
    }

    if (editingEvent.value) {
      const updateData: UpdateCalendarEvent = {
        ...eventData,
        status: newEvent.value.status as EventStatus,
        updatedAt: new Date().toISOString()
      }
      
      if (isRecurringEvent(editingEvent.value)) {
        await eventsStore.updateRecurringEvent(
          editingEvent.value.id,
          updateData,
          deleteRecurringOption.value
        )
      } else {
        await eventsStore.updateEvent(editingEvent.value.id, updateData)
      }
    } else {
      if (recurrencePattern.value.frequency) {
        await eventsStore.createRecurringEvent(eventData, recurrencePattern.value)
      } else {
        await eventsStore.createEvent(eventData)
      }
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

async function fetchEventsForCurrentView(): Promise<void> {
  try {
    isLoading.value = true
    error.value = null
    
    const filters: EventFilters = {
      start: format(startOfWeek(currentDate.value), 'yyyy-MM-dd'),
      end: format(endOfWeek(currentDate.value), 'yyyy-MM-dd')
    }
    
    if (currentView.value === 'month') {
      filters.start = format(startOfMonth(currentDate.value), 'yyyy-MM-dd')
      filters.end = format(endOfMonth(currentDate.value), 'yyyy-MM-dd')
    }
    
    await eventsStore.fetchEvents(filters)
  } catch (err) {
    error.value = err instanceof Error ? err : new Error('Failed to fetch events')
    console.error('Error fetching events:', err)
  } finally {
    isLoading.value = false
  }
}

// Utility Functions
function formatHour(hour: number): string {
  return format(addHours(startOfDay(new Date()), hour), 'h a')
}

function formatEventTime(time: string): string {
  if (!time) return ''
  try {
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

function getEventStyles(event: CalendarEvent): CSSProperties {
  const time = event.startTime || event.time
  if (!time) return {}

  try {
    const [hours, minutes] = time.split(':').map(Number)
    const startMinutes = (hours * 60) + minutes
    const top = ((startMinutes - (hours[0] * 60)) / 60) * 100
    const height = (event.duration / 60) * 100

    return {
      top: `${top}%`,
      height: `${height}%`,
      position: 'absolute',
      left: '2px',
      right: '2px',
      zIndex: isDragging.value && draggedEvent.value?.id === event.id ? 1000 : 1
    }
  } catch (error) {
    console.error('Error calculating event styles:', error)
    return {}
  }
}

// Lifecycle
onMounted(async () => {
  try {
    await Promise.all([
      customersStore.fetchCustomers(),
      fetchEventsForCurrentView()
    ])
  } catch (error) {
    console.error('Error in calendar mount:', error)
  }
})

// Watchers
watch([currentDate, currentView], () => {
  fetchEventsForCurrentView()
})

watch(
  () => newEvent.value.date,
  async (newDate) => {
    if (newDate) {
      await checkAvailability(newDate)
      await checkConflicts()
    }
  }
)

watch(
  [
    () => newEvent.value.time,
    () => newEvent.value.duration
  ],
  async () => {
    await checkConflicts()
  }
)
</script>

<style scoped>
/* Previous styles remain the same, adding new styles for new features */

/* Recurring Event Indicator */
.recurring-indicator {
  position: absolute;
  top: 4px;
  right: 16px;
  font-size: 12px;
  opacity: 0.8;
}

/* Unavailable Time Slots */
.hour-slot.unavailable {
  background-color: var(--surface-3);
  cursor: not-allowed;
}

/* Conflict Indicators */
.hour-slot.has-conflict {
  background-color: var(--error-50);
}

.conflict-warning {
  color: var(--error);
  padding: var(--space-2);
  margin-top: var(--space-2);
  background-color: var(--error-50);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

/* Recurring Delete Options */
.recurring-delete-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-top: var(--space-4);
}

.recurring-delete-options label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
}

<style scoped>
/* Container */
.calendar-container {
  background: var(--surface-1);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-1);
  padding: var(--space-4);
  height: calc(100vh - 12rem);
  display: flex;
  flex-direction: column;
}

/* Header Styles */
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

.nav-button {
  background-color: var(--primary-blue);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-button:hover {
  background-color: var(--primary-dark);
  transform: translateY(-1px);
}

.nav-button:active {
  transform: translateY(0);
}

/* Week View Styles */
.week-view-container {
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

/* Month View Styles */
.month-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

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

.days {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: minmax(100px, 1fr);
  gap: 1px;
  background: var(--border-color);
}

.day {
  background: var(--surface-1);
  padding: var(--space-2);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.day.other-month {
  background: var(--surface-2);
  color: var(--text-3);
}

.day.today {
  background: var(--primary-50);
}

/* Calendar Events */
.calendar-event {
  position: absolute;
  left: 2px;
  right: 2px;
  padding: var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  color: white;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background-color: var(--primary-blue);
}

.calendar-event:hover {
  transform: scale(1.02);
  box-shadow: var(--shadow-lg);
  z-index: 100;
}

.calendar-event.is-dragging {
  opacity: 0.7;
  transform: scale(1.05);
  z-index: 1000;
}

.calendar-event.is-recurring {
  border-left: 3px solid var(--warning);
}

/* Event Status Styles */
.calendar-event.scheduled {
  background-color: var(--primary-blue);
}

.calendar-event.completed {
  background-color: var(--success);
}

.calendar-event.cancelled {
  background-color: var(--error);
  text-decoration: line-through;
}

.event-status-indicator {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.recurring-indicator {
  position: absolute;
  top: 4px;
  right: 16px;
  font-size: 12px;
  opacity: 0.8;
}

.event-time {
  font-weight: 600;
  font-size: var(--font-size-xs);
  margin-bottom: var(--space-1);
}

.event-title {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: var(--space-1);
}

.event-customer {
  font-size: var(--font-size-xs);
  opacity: 0.9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Modal Form Styles */
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

.form-input,
.form-select,
.form-textarea {
  padding: var(--space-2);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--surface-1);
  width: 100%;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 2px var(--primary-50);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-error {
  color: var(--error);
  font-size: var(--font-size-sm);
  margin-top: var(--space-2);
}

.conflict-warning {
  color: var(--error);
  padding: var(--space-2);
  margin-top: var(--space-2);
  background-color: var(--error-50);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

/* Modal Actions */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
}

/* Recurring Delete Options */
.recurring-delete-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-top: var(--space-4);
}

.recurring-delete-options label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
}

/* Loading States */
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

/* Responsive Styles */
@media (max-width: 1024px) {
  .calendar-container {
    padding: var(--space-2);
  }

  .calendar-nav h2 {
    min-width: 150px;
    font-size: var(--font-size-base);
  }
}

@media (max-width: 768px) {
  .calendar-header {
    flex-direction: column;
    gap: var(--space-4);
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .calendar-event {
    font-size: var(--font-size-xs);
  }

  .event-customer {
    display: none;
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

  .calendar-nav {
    width: 100%;
    justify-content: space-between;
  }

  .calendar-actions {
    width: 100%;
    justify-content: space-between;
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .calendar-event {
    border-color: rgba(255, 255, 255, 0.1);
  }

  .hour-slot:hover {
    background-color: var(--surface-3);
  }
}
</style>