<template>
  <div class="job-details-container">
    <div v-if="loading" class="loading-state">
      Loading...
    </div>
    
    <div v-else-if="error" class="error-state">
      {{ error }}
      <button @click="loadEventData" class="btn btn-primary">Retry</button>
    </div>

    <div v-else-if="event" class="job-details">
      <!-- Debug section -->
      <pre class="debug">{{ JSON.stringify(event, null, 2) }}</pre>
      
      <h1>{{ event.title }}</h1>
      <div class="event-meta">
        <p>Date: {{ formatDateTime(event.date, event.time) }}</p>
        <p>Duration: {{ formatDuration(event.duration) }}</p>
        <p>Status: {{ event.status }}</p>
      </div>

      <div v-if="customer" class="customer-details">
        <h2>Customer Details</h2>
        <p>Name: {{ customer.name }}</p>
        <p>Phone: {{ customer.phone }}</p>
        <p>Email: {{ customer.email }}</p>
        <p>Address: {{ customer.address }}</p>
      </div>

      <div class="event-actions">
        <button 
          class="btn btn-primary"
          @click="updateStatus('completed')"
          :disabled="event.status === 'completed'"
        >
          Mark as Completed
        </button>
        <button 
          class="btn btn-danger"
          @click="updateStatus('cancelled')"
          :disabled="event.status === 'cancelled'"
        >
          Cancel Appointment
        </button>
        <button 
          class="btn btn-secondary"
          @click="router.push('/')"
        >
          Back to Calendar
        </button>
      </div>
    </div>

    <div v-else class="not-found">
      Event not found
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

const route = useRoute()
const router = useRouter()
const eventsStore = useEventsStore()
const customersStore = useCustomersStore()

const event = ref<CalendarEvent | null>(null)
const customer = ref<Customer | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

function formatDateTime(date: Date | string, time: string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'MMMM d, yyyy') + ' at ' + format(new Date(`2000-01-01T${time}`), 'h:mm a')
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} minutes`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes 
    ? `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minutes`
    : `${hours} hour${hours > 1 ? 's' : ''}`
}

async function updateStatus(status: 'completed' | 'cancelled') {
  if (!event.value?.id) return
  
  try {
    loading.value = true
    await eventsStore.updateEventStatus(event.value.id, status)
    await loadEventData()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to update status'
  } finally {
    loading.value = false
  }
}

async function loadEventData() {
  const eventId = route.params.id as string
  loading.value = true
  error.value = null
  
  try {
    const eventData = await eventsStore.getEvent(eventId)
    if (!eventData) {
      throw new Error('Event not found')
    }
    event.value = eventData
    
    if (eventData?.customerId) {
      const customerData = await customersStore.getCustomer(eventData.customerId)
      customer.value = customerData
    }
  } catch (err) {
    console.error('Error fetching job details:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load event'
  } finally {
    loading.value = false
  }
}

onMounted(loadEventData)
</script>

<style scoped>
.job-details-container {
  padding: var(--space-4);
  max-width: 800px;
  margin: 0 auto;
}

.loading-state,
.error-state,
.not-found {
  text-align: center;
  padding: var(--space-8);
}

.job-details {
  background: var(--surface-1);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-1);
}

.debug {
  background: var(--surface-2);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-4);
  overflow-x: auto;
}

.event-meta {
  margin: var(--space-4) 0;
  padding: var(--space-4);
  background: var(--surface-2);
  border-radius: var(--radius-md);
}

.customer-details {
  margin: var(--space-4) 0;
  padding: var(--space-4);
  background: var(--surface-2);
  border-radius: var(--radius-md);
}

.event-actions {
  margin-top: var(--space-6);
  display: flex;
  gap: var(--space-4);
  justify-content: flex-end;
}

@media (max-width: 640px) {
  .event-actions {
    flex-direction: column;
  }
}
</style>