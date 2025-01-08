<template>
  <Modal v-model="isOpen">
    <template #header>
      <h3>{{ editingEvent ? 'Edit Appointment' : 'New Appointment' }}</h3>
    </template>

    <template #default>
      <form @submit.prevent="handleSubmit" class="event-form">
        <!-- Title -->
        <div class="form-group">
          <label for="eventTitle">Title</label>
          <input
            id="eventTitle"
            v-model="formData.title"
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
              v-model="formData.date"
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
              v-model="formData.time"
              required
              class="form-select"
              @change="handleTimeChange"
            >
              <option value="">Select time</option>
              <option 
                v-for="slot in timeSlots"
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
            v-model="formData.duration"
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
            v-model="formData.customerId"
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

        <!-- Recurrence (Only for new events) -->
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
                :min-date="formData.date"
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
            v-model="formData.notes"
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
            v-model="formData.status"
            class="form-select"
          >
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rescheduled">Rescheduled</option>
          </select>
        </div>

        <!-- Validation Errors -->
        <div v-if="error" class="form-error">
          {{ error }}
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
          @click="$emit('delete')"
        >
          Delete
        </button>
        <button 
          class="btn btn-secondary"
          type="button"
          @click="handleCancel"
        >
          Cancel
        </button>
        <button 
          class="btn btn-primary"
          type="submit"
          @click="handleSubmit"
          :disabled="isSubmitting || hasConflict"
        >
          {{ isSubmitting ? 'Saving...' : (editingEvent ? 'Update' : 'Create') }}
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { format } from 'date-fns'
import Datepicker from '@vuepic/vue-datepicker'
import Modal from '@/components/Modal.vue'
import type { 
  CalendarEvent, 
  NewCalendarEvent,
  TimeSlot,
  EventRecurrence,
  Customer,
  EventStatus 
} from '@/types/calendar'

// Helper function to convert CalendarEvent to NewCalendarEvent
function convertToFormData(event: CalendarEvent): NewCalendarEvent {
  return {
    title: event.title,
    date: new Date(event.date),
    time: event.time,
    duration: event.duration,
    customerId: event.customerId,
    notes: event.notes,
    status: event.status
  }
}

const props = defineProps<{
  modelValue: boolean
  editingEvent: CalendarEvent | null
  availableTimeSlots: TimeSlot[]
  customers: Customer[]
  hasConflict: boolean
  isSubmitting?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'save': [data: NewCalendarEvent, recurrence?: EventRecurrence]
  'delete': []
  'cancel': []
}>()

// State
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formData = ref<NewCalendarEvent>({
  title: '',
  date: new Date(),
  time: '',
  duration: 60,
  customerId: '',
  notes: '',
  status: 'scheduled'
})

const isRecurring = ref(false)
const recurrenceEndType = ref<'date' | 'occurrences'>('date')
const recurrencePattern = ref<EventRecurrence>({
  frequency: 'weekly',
  interval: 1,
  endDate: undefined,
  endAfterOccurrences: undefined
})
const error = ref<string | null>(null)
const dateFormat = 'dd/MM/yyyy'

// Computed
const timeSlots = computed(() => {
  const slots: TimeSlot[] = []
  const start = 8 // 8 AM
  const end = 18 // 6 PM
  
  for (let hour = start; hour < end; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const formattedHour = hour.toString().padStart(2, '0')
      const formattedMinute = minute.toString().padStart(2, '0')
      const time = `${formattedHour}:${formattedMinute}`
      
      slots.push({
        start: time,
        end: time,
        available: true
      })
    }
  }
  
  // Merge with actual availability data
  return slots.map(slot => {
    const actualSlot = props.availableTimeSlots.find(s => s.start === slot.start)
    return actualSlot || slot
  })
})

// Methods
function handleSubmit() {
  error.value = null

  if (!formData.value.title.trim()) {
    error.value = 'Title is required'
    return
  }

  if (props.hasConflict) {
    error.value = 'Please resolve time conflicts before saving'
    return
  }

  emit('save', 
    formData.value, 
    isRecurring.value ? recurrencePattern.value : undefined
  )
}

function handleCancel() {
  emit('cancel')
  resetForm()
}

function handleDateChange() {
  // Reset time when date changes
  formData.value.time = ''
}

function handleTimeChange() {
  // Additional time change handling if needed
}

function handleDurationChange() {
  // Additional duration change handling if needed
}

function resetForm() {
  formData.value = {
    title: '',
    date: new Date(),
    time: '',
    duration: 60,
    customerId: '',
    notes: '',
    status: 'scheduled'
  }
  isRecurring.value = false
  recurrencePattern.value = {
    frequency: 'weekly',
    interval: 1,
    endDate: undefined,
    endAfterOccurrences: undefined
  }
  error.value = null
}

function formatTimeSlot(slot: TimeSlot): string {
  const date = new Date(`2000-01-01T${slot.start}`)
  return format(date, 'h:mm a') // e.g., "9:15 AM"
}

// Watchers
watch(() => props.editingEvent, (newEvent) => {
  if (newEvent) {
    formData.value = convertToFormData(newEvent)
  } else {
    resetForm()
  }
})
</script>

<style scoped>
/* Form Container */
.event-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* Form Layout */
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

/* Form Elements */
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

/* Error States */
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

/* Recurrence Section */
.recurrence-section {
  border-top: 1px solid var(--border-color);
  padding-top: var(--space-4);
  margin-top: var(--space-4);
}

.recurrence-toggle {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.recurrence-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* Date Picker Customization */
.date-picker {
  width: 100%;
}

.date-picker :deep(.dp__input) {
  padding: var(--space-2);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--surface-1);
  width: 100%;
}

.date-picker :deep(.dp__input:focus) {
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 2px var(--primary-50);
}

/* Modal Actions */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-4);
}

/* Loading State */
.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-color);
  border-top-color: var(--primary-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive Styles */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .modal-actions button {
    width: 100%;
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .form-input,
  .form-select,
  .form-textarea {
    background: var(--surface-2);
    color: var(--text-1);
  }

  .loading-overlay {
    background: rgba(0, 0, 0, 0.5);
  }

  .conflict-warning {
    background-color: var(--error-900);
  }

  .date-picker :deep(.dp__input) {
    background: var(--surface-2);
    color: var(--text-1);
  }
}
</style>