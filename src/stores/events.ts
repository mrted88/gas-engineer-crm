import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CalendarEvent, NewCalendarEvent } from '@/types/event'
import { api } from '@/services/api'
import { format, isSameDay } from 'date-fns'

export const useEventsStore = defineStore('events', () => {
  // State
  const events = ref<CalendarEvent[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const selectedEvent = ref<CalendarEvent | null>(null)

  // Getters
  const getEventsByDate = computed(() => (date: Date) => {
    return events.value.filter(event => 
      isSameDay(new Date(event.date), date)
    )
  })

  const getEventsByDateRange = computed(() => (start: Date, end: Date) => {
    return events.value.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate >= start && eventDate <= end
    })
  })

  const upcomingEvents = computed(() => {
    const now = new Date()
    return events.value
      .filter(event => new Date(event.date) > now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5)
  })

  const todaysEvents = computed(() => {
    return events.value
      .filter(event => isSameDay(new Date(event.date), new Date()))
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  })

  // Actions
  async function fetchEvents(start: Date, end: Date) {
    try {
      loading.value = true
      error.value = null
      const response = await api.events.list({
        start: format(start, 'yyyy-MM-dd'),
        end: format(end, 'yyyy-MM-dd')
      })
      events.value = response.map(event => ({
        ...event,
        date: new Date(event.date)
      }))
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch events'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createEvent(eventData: NewCalendarEvent) {
    try {
      loading.value = true
      error.value = null
      const response = await api.events.create(eventData)
      events.value.push({
        ...response,
        date: new Date(response.date)
      })
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create event'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateEvent(id: string, eventData: Partial<CalendarEvent>) {
    try {
      loading.value = true
      error.value = null
      const response = await api.events.update(id, eventData)
      const index = events.value.findIndex(e => e.id === id)
      if (index !== -1) {
        events.value[index] = {
          ...response,
          date: new Date(response.date)
        }
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
      if (selectedEvent.value?.id === id) {
        selectedEvent.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete event'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateEventStatus(id: string, status: CalendarEvent['status']) {
    try {
      loading.value = true
      error.value = null
      const response = await api.events.updateStatus(id, status)
      const index = events.value.findIndex(e => e.id === id)
      if (index !== -1) {
        events.value[index] = {
          ...response,
          date: new Date(response.date)
        }
      }
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update event status'
      throw err
    } finally {
      loading.value = false
    }
  }

  function selectEvent(event: CalendarEvent | null) {
    selectedEvent.value = event
  }

  function resetState() {
    events.value = []
    loading.value = false
    error.value = null
    selectedEvent.value = null
  }

  return {
    // State
    events,
    loading,
    error,
    selectedEvent,

    // Getters
    getEventsByDate,
    getEventsByDateRange,
    upcomingEvents,
    todaysEvents,

    // Actions
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    updateEventStatus,
    selectEvent,
    resetState
  }
})