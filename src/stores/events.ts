import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { 
  CalendarEvent,
  NewCalendarEvent,
  UpdateCalendarEvent,
  EventFilters,
  EventResponse,
  EventsResponse,
  TimeSlot,
  EventConflict,
  EventRecurrence,
  RecurringEvent
} from '@/types/event'
import { api } from '@/services/api'

export const useEventsStore = defineStore('events', {
  state: () => ({
    events: ref<CalendarEvent[]>([]),
    isLoading: ref(false),
    error: ref<Error | null>(null)
  }),

  getters: {
    getEventById: (state) => {
      return (id: string) => state.events.find(event => event.id === id)
    },
    
    getEventsByCustomerId: (state) => {
      return (customerId: string) => state.events.filter(event => event.customerId === customerId)
    },
    
    getUpcomingEvents: (state) => {
      return state.events
        .filter(event => new Date(event.date) >= new Date())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }
  },

  actions: {
    async fetchEvents(filters: EventFilters): Promise<void> {
      try {
        this.isLoading = true
        const response = await api.get<EventsResponse>('/events', { params: filters })
        this.events = response.data.data
      } catch (error) {
        this.error = error as Error
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async createEvent(event: NewCalendarEvent): Promise<CalendarEvent> {
      try {
        const response = await api.post<EventResponse>('/events', event)
        this.events.push(response.data.data)
        return response.data.data
      } catch (error) {
        this.error = error as Error
        throw error
      }
    },

    async updateEvent(id: string, data: UpdateCalendarEvent): Promise<CalendarEvent> {
      try {
        const response = await api.put<EventResponse>(`/events/${id}`, data)
        const index = this.events.findIndex(event => event.id === id)
        if (index !== -1) {
          this.events[index] = response.data.data
        }
        return response.data.data
      } catch (error) {
        this.error = error as Error
        throw error
      }
    },

    async deleteEvent(id: string): Promise<void> {
      try {
        await api.delete(`/events/${id}`)
        this.events = this.events.filter(event => event.id !== id)
      } catch (error) {
        this.error = error as Error
        throw error
      }
    },

    // New methods for availability and conflicts
    async checkAvailability(params: { 
      date: string, 
      timeSlots: TimeSlot[] 
    }): Promise<{ timeSlots: TimeSlot[] }> {
      try {
        const response = await api.post<{ timeSlots: TimeSlot[] }>(
          '/events/availability', 
          params
        )
        return response.data
      } catch (error) {
        this.error = error as Error
        throw error
      }
    },

    async checkConflicts(params: { 
      date: string, 
      time: string, 
      duration: number, 
      excludeEventId?: string 
    }): Promise<EventConflict> {
      try {
        const response = await api.post<EventConflict>(
          '/events/conflicts', 
          params
        )
        return response.data
      } catch (error) {
        this.error = error as Error
        throw error
      }
    },

    // Recurring event methods
    async createRecurringEvent(
      event: NewCalendarEvent, 
      recurrence: EventRecurrence
    ): Promise<RecurringEvent> {
      try {
        const response = await api.post<EventResponse>('/events/recurring', {
          event,
          recurrence
        })
        this.events.push(response.data.data)
        return response.data.data as RecurringEvent
      } catch (error) {
        this.error = error as Error
        throw error
      }
    },

    async updateRecurringEvent(
      eventId: string,
      data: UpdateCalendarEvent,
      option: 'single' | 'future' | 'all'
    ): Promise<void> {
      try {
        const response = await api.put<EventResponse>(`/events/recurring/${eventId}`, {
          ...data,
          updateOption: option
        })
        
        // Update events based on the response
        if (option === 'single') {
          const index = this.events.findIndex(event => event.id === eventId)
          if (index !== -1) {
            this.events[index] = response.data.data
          }
        } else {
          // Refresh all events as multiple might have been updated
          await this.fetchEvents({
            start: new Date().toISOString(),
            end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          })
        }
      } catch (error) {
        this.error = error as Error
        throw error
      }
    },

    async deleteRecurringEvent(
      eventId: string,
      option: 'single' | 'future' | 'all'
    ): Promise<void> {
      try {
        await api.delete(`/events/recurring/${eventId}`, {
          data: { deleteOption: option }
        })
        
        if (option === 'single') {
          this.events = this.events.filter(event => event.id !== eventId)
        } else {
          // Refresh all events as multiple might have been deleted
          await this.fetchEvents({
            start: new Date().toISOString(),
            end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          })
        }
      } catch (error) {
        this.error = error as Error
        throw error
      }
    },

    // Utility methods
    clearError() {
      this.error = null
    },

    resetState() {
      this.events = []
      this.isLoading = false
      this.error = null
    }
  }
})