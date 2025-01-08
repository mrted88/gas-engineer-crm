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

    <!-- Calendar Views -->
    <div v-else class="calendar-grid">
      <WeekView
        v-if="currentView === 'week'"
        :current-date="currentDate"
        :events="filteredEvents"
        :is-loading="isLoading"
        @date-click="openNewEventModal"
        @event-click="openEventDetails"
      />

      <MonthView
        v-else-if="currentView === 'month'"
        :current-date="currentDate"
        :events="filteredEvents"
        :is-loading="isLoading"
        @date-click="openNewEventModal"
        @event-click="openEventDetails"
      />

      <DayView
        v-else-if="currentView === 'day'"
        :current-date="currentDate"
        :events="filteredEvents"
        :is-loading="isLoading"
        @date-click="openNewEventModal"
        @event-click="openEventDetails"
      />

      <AgendaView
        v-else
        :current-date="currentDate"
        :events="filteredEvents"
        :is-loading="isLoading"
        @event-click="openEventDetails"
      />
    </div>

    <!-- Event Form Modal -->
    <EventFormModal
      v-model="showEventModal"
      :editing-event="selectedEvent"
      :available-time-slots="availableTimeSlots"
      :customers="customers"
      :has-conflict="hasTimeConflict"
      :is-submitting="isSubmitting"
      @save="handleEventSave"
      @delete="handleEventDelete"
      @cancel="closeEventModal"
    />

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmationModal
      v-model="showDeleteModal"
      :event="selectedEvent"
      :is-deleting="isDeleting"
      @confirm="confirmDelete"
      @cancel="closeDeleteModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { format, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { useEventsStore } from '@/stores/events'
import type { 
  CalendarEvent, 
  ViewType as CalendarViewType,
  EventFormState,
  NewCalendarEvent,
  UpdateCalendarEvent,
  EventRecurrence,
  TimeSlot,
  EventStatus
} from '@/types/calendar'
import WeekView from './WeekView.vue'
import MonthView from './MonthView.vue'
import DayView from './DayView.vue'
import AgendaView from './AgendaView.vue'
import EventFormModal from './EventFormModal.vue'
import DeleteConfirmationModal from './DeleteConfirmationModal.vue'
import { api } from '@/services/api'

// Store
const eventsStore = useEventsStore()

// State
const currentDate = ref(new Date())
const currentView = ref<CalendarViewType>('week')
const selectedEvent = ref<CalendarEvent | null>(null)
const showEventModal = ref(false)
const showDeleteModal = ref(false)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const hasTimeConflict = ref(false)
const customers = ref(await api.customers.list())
const availableTimeSlots = ref<TimeSlot[]>([])

// Constants
const views: CalendarViewType[] = ['month', 'week', 'day', 'agenda']
const VISIBLE_STATUSES: EventStatus[] = ['scheduled', 'completed', 'rescheduled']

// Computed
const currentMonthYear = computed(() => {
  return format(currentDate.value, 'MMMM yyyy')
})

const filteredEvents = computed(() => {
  return eventsStore.events.filter(event => 
    VISIBLE_STATUSES.includes(event.status)
  )
})

const { isLoading, error } = eventsStore

// Methods
function handleNavigation(direction: 'previous' | 'next') {
  if (direction === 'previous') {
    currentDate.value = subMonths(currentDate.value, 1)
  } else {
    currentDate.value = addMonths(currentDate.value, 1)
  }
}

function openNewEventModal(date: Date, hour?: number) {
  selectedEvent.value = null
  showEventModal.value = true
}

function openEventDetails(event: CalendarEvent) {
  selectedEvent.value = event
  showEventModal.value = true
}

function closeEventModal() {
  showEventModal.value = false
  selectedEvent.value = null
}

async function handleEventSave(
  eventData: NewCalendarEvent, 
  recurrence?: EventRecurrence
) {
  try {
    isSubmitting.value = true
    if (selectedEvent.value) {
      // Create a type-safe update object
      const updateData = {
        title: eventData.title,
        date: eventData.date,
        time: eventData.time,
        duration: eventData.duration,
        customerId: eventData.customerId,
        notes: eventData.notes,
        status: eventData.status,
        updatedAt: new Date().toISOString()
      }
      await eventsStore.updateEvent(selectedEvent.value.id, updateData)
    } else if (recurrence) {
      await eventsStore.createRecurringEvent(eventData, recurrence)
    } else {
      await eventsStore.createEvent(eventData)
    }
    closeEventModal()
  } catch (err) {
    console.error('Error saving event:', err)
  } finally {
    isSubmitting.value = false
  }
}

function handleEventDelete() {
  if (selectedEvent.value) {
    showDeleteModal.value = true
  }
}

function closeDeleteModal() {
  showDeleteModal.value = false
}

async function confirmDelete(option: 'single' | 'future' | 'all') {
  if (!selectedEvent.value) return

  try {
    isDeleting.value = true
    if ('recurrence' in selectedEvent.value) {
      await eventsStore.deleteRecurringEvent(selectedEvent.value.id, option)
    } else {
      await eventsStore.deleteEvent(selectedEvent.value.id)
    }
    closeDeleteModal()
    closeEventModal()
  } catch (err) {
    console.error('Error deleting event:', err)
  } finally {
    isDeleting.value = false
  }
}

async function fetchEventsForCurrentView() {
  const start = startOfMonth(currentDate.value).toISOString()
  const end = endOfMonth(currentDate.value).toISOString()
  
  await eventsStore.fetchEvents({ start, end })
}

// Lifecycle
onMounted(fetchEventsForCurrentView)

// Watchers
watch([currentDate, currentView], fetchEventsForCurrentView)
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

/* Calendar Grid */
.calendar-grid {
  flex: 1;
  overflow: hidden;
  position: relative;
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

  .calendar-actions {
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 480px) {
  .calendar-nav {
    width: 100%;
    justify-content: space-between;
  }

  .calendar-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>