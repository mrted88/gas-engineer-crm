<template>
  <div class="job-details-container">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      Loading...
    </div>
    
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadEventData" class="btn btn-primary">Retry</button>
      <button @click="router.push('/')" class="btn btn-secondary">Back to Calendar</button>
    </div>

    <div v-else-if="event" class="job-details">
      <div class="job-header">
        <h1>{{ event.title }}</h1>
        <div class="status-badge" :class="event.status">
          {{ event.status }}
        </div>
      </div>

      <div class="event-meta">
        <div class="meta-item">
          <i class="fas fa-calendar"></i>
          <span>{{ formatDate(event.date) }}</span>
        </div>
        <div class="meta-item">
          <i class="fas fa-clock"></i>
          <span>{{ formatTime(event.time) }}</span>
        </div>
        <div class="meta-item">
          <i class="fas fa-hourglass-half"></i>
          <span>{{ formatDuration(event.duration) }}</span>
        </div>
      </div>

      <div v-if="customer" class="customer-details">
        <h2>Customer Details</h2>
        <div class="customer-info">
          <div class="info-item">
            <label>Name:</label>
            <span>{{ customer.name }}</span>
          </div>
          <div class="info-item">
            <label>Phone:</label>
            <span>{{ customer.phone }}</span>
          </div>
          <div class="info-item">
            <label>Email:</label>
            <span>{{ customer.email }}</span>
          </div>
          <div class="info-item">
            <label>Address:</label>
            <span>{{ customer.address }}</span>
          </div>
        </div>
      </div>

      <div v-if="event.notes" class="notes-section">
        <h2>Notes</h2>
        <p>{{ event.notes }}</p>
      </div>

      <div class="action-buttons">
        <button 
          v-if="event.status === 'scheduled'"
          class="btn btn-success"
          @click="updateStatus('completed')"
        >
          Mark as Completed
        </button>
        <button 
          v-if="event.status === 'scheduled'"
          class="btn btn-danger"
          @click="updateStatus('cancelled')"
        >
          Cancel Appointment
        </button>
        <button 
          class="btn btn-primary"
          @click="router.push('/')"
        >
          Back to Calendar
        </button>
      </div>
    </div>

    <div v-else class="not-found">
      <p>Event not found</p>
      <button @click="router.push('/')" class="btn btn-primary">Back to Calendar</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { format } from 'date-fns'
import { useEventsStore } from '@/stores/events'
import { useCustomersStore } from '@/stores/customers'
import type { CalendarEvent } from '@/types/event'
import type { Customer } from '@/types/customer'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const eventsStore = useEventsStore()
const customersStore = useCustomersStore()

const event = ref<CalendarEvent | null>(null)
const customer = ref<Customer | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

function formatDate(date: string | Date): string {
  return format(new Date(date), 'EEEE, MMMM d, yyyy')
}

function formatTime(time: string): string {
  return format(new Date(`2000-01-01T${time}`), 'h:mm a')
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (hours === 0) return `${minutes} minutes`
  return remainingMinutes > 0 
    ? `${hours}h ${remainingMinutes}m`
    : `${hours} hour${hours > 1 ? 's' : ''}`
}

async function updateStatus(newStatus: 'completed' | 'cancelled') {
  if (!event.value?.id) return
  
  try {
    loading.value = true
    await eventsStore.updateEventStatus(event.value.id, newStatus)
    await loadEventData() // Reload the event data
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to update status'
  } finally {
    loading.value = false
  }
}

// In the loadEventData function, update it to:
async function loadEventData() {
  const eventId = route.params.id as string
  if (!eventId) {
    router.push('/')
    return
  }

  loading.value = true
  error.value = null
  
  try {
    console.log('Loading event data:', {
      eventId,
      path: route.fullPath,
      isAuthenticated: useAuthStore().isAuthenticated
    })

    // First try to find the event in the store
    let eventData = eventsStore.events.find(e => e.id === eventId)
    
    if (!eventData) {
      console.log('Event not found in store, fetching from API')
      eventData = await eventsStore.getEvent(eventId)
    }

    if (!eventData) {
      throw new Error('Event not found')
    }

    event.value = eventData
    console.log('Event loaded:', eventData)

    // Fetch customer details if we have a customerId
    if (eventData.customerId) {
      customer.value = await customersStore.getCustomer(eventData.customerId)
    }
  } catch (err) {
    console.error('Error loading event:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load event'
  } finally {
    loading.value = false
  }
}

onMounted(loadEventData)
</script>

<style scoped>
.job-details-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.loading-state,
.error-state,
.not-found {
  text-align: center;
  padding: 2rem;
}

.job-details {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 999px;
  text-transform: capitalize;
  font-weight: 500;
}

.status-badge.scheduled {
  background-color: #e3f2fd;
  color: #1976d2;
}

.status-badge.completed {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-badge.cancelled {
  background-color: #ffebee;
  color: #c62828;
}

.event-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.customer-details,
.notes-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
}

.customer-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item label {
  font-weight: 500;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: flex-end;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 640px) {
  .action-buttons {
    flex-direction: column;
  }
  
  .event-meta {
    grid-template-columns: 1fr;
  }
}
</style>