import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/services/api'
import type { 
  CalendarEvent, 
  EventStatus, 
  NewCalendarEvent,
  UpdateCalendarEvent,
  EventSearchParams
} from '@/types/event'

export const useEventsStore = defineStore('events', () => {
  const events = ref<CalendarEvent[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  async function fetchEvents(params?: { start: string; end: string }) {
    try {
      loading.value = true
      error.value = null
      console.log('Store: Fetching events with params:', params)
      const response = await api.events.list(params)
      console.log('Store: Received events:', response)
      events.value = response
      console.log('Store: Updated events array:', events.value)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch events'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createEvent(data: NewCalendarEvent) {
    try {
      loading.value = true
      error.value = null
      
      // Validate required fields
      if (!data.title || !data.date) {
        throw new Error('Missing required fields')
      }
      
      const eventData: Omit<CalendarEvent, "id"> = {
        title: data.title,
        date: data.date,
        time: data.time,
        duration: data.duration,
        customerId: data.customerId,
        notes: data.notes,
        status: 'scheduled',
        customerName: 'Unknown', // This will be set by the API
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
  
      console.log('Store: Creating event with data:', eventData)
      const response = await api.events.create(eventData)
      console.log('Store: Received response:', response)
      events.value = [...events.value, response]
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create event'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateEvent(id: string, data: UpdateCalendarEvent) {
    try {
      loading.value = true
      error.value = null
      const response = await api.events.update(id, data)
      const index = events.value.findIndex(e => e.id === id)
      if (index !== -1) {
        events.value[index] = response
      }
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update event'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteEvent(id: string) {
    try {
      loading.value = true
      error.value = null
      await api.events.delete(id)
      events.value = events.value.filter(e => e.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete event'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateEventStatus(id: string, status: EventStatus) {
    try {
      loading.value = true
      error.value = null
      const response = await api.events.updateStatus(id, status)
      const index = events.value.findIndex(e => e.id === id)
      if (index !== -1) {
        events.value[index] = { ...events.value[index], status }
      }
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update event status'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function getEvent(id: string) {
    try {
      loading.value = true
      error.value = null
      const response = await api.events.get(id)
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch event'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function searchEvents(params: EventSearchParams) {
    try {
      loading.value = true
      error.value = null
      const response = await api.events.search(params)
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to search events'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    updateEventStatus,
    getEvent,
    searchEvents
  }
})