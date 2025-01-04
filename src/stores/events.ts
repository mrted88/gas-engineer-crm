import { ref, watch } from 'vue'
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

  // Load events from localStorage on initialization
  const savedEvents = localStorage.getItem('events')
  if (savedEvents) {
    try {
      events.value = JSON.parse(savedEvents)
    } catch (e) {
      console.error('Error loading saved events:', e)
    }
  }

  // Watch for changes and save to localStorage
  watch(
    events,
    (newEvents) => {
      localStorage.setItem('events', JSON.stringify(newEvents))
    },
    { deep: true }
  )

  // Actions
  async function fetchEvents(params?: { start: string; end: string }) {
    try {
      loading.value = true
      error.value = null
      console.log('Store: Fetching events with params:', params)
      
      const response = await api.events.list(params)
      
      // Ensure dates are properly parsed
      const processedEvents = response.map(event => ({
        ...event,
        date: new Date(event.date),
        startTime: event.startTime || event.time
      }))
      
      events.value = processedEvents
      console.log('Store: Updated events array:', events.value)
      
      return processedEvents
    } catch (err) {
      console.error('Error fetching events:', err)
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
      
      if (!data.title || !data.date) {
        throw new Error('Missing required fields')
      }
      
      const eventData = {
        title: data.title,
        date: data.date,
        time: data.time,
        startTime: data.time,
        duration: data.duration,
        customerId: data.customerId,
        notes: data.notes,
        status: 'scheduled' as EventStatus,
        customerName: 'Unknown',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
  
      console.log('Store: Creating event with data:', eventData)
      const response = await api.events.create(eventData)
      console.log('Store: Received response:', response)
      
      // Update local state before any potential redirect
      const newEvent = { ...response }
      events.value = [...events.value, newEvent]
      
      return response
    } catch (err) {
      console.error('Error creating event:', err)
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
      
      const updatedData = {
        ...data,
        updatedAt: new Date().toISOString()
      }
      
      const response = await api.events.update(id, updatedData)
      
      // Update local state
      const index = events.value.findIndex(e => e.id === id)
      if (index !== -1) {
        events.value[index] = response
      }
      
      return response
    } catch (err) {
      console.error('Error updating event:', err)
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
      
      // Update local state
      events.value = events.value.filter(e => e.id !== id)
      
    } catch (err) {
      console.error('Error deleting event:', err)
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
      
      // Update local state
      const index = events.value.findIndex(e => e.id === id)
      if (index !== -1) {
        events.value[index] = { 
          ...events.value[index], 
          status,
          updatedAt: new Date().toISOString()
        }
      }
      
      return response
    } catch (err) {
      console.error('Error updating event status:', err)
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
      console.error('Error fetching event:', err)
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
      console.error('Error searching events:', err)
      error.value = err instanceof Error ? err.message : 'Failed to search events'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    events,
    loading,
    error,
    
    // Actions
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    updateEventStatus,
    getEvent,
    searchEvents
  }
})