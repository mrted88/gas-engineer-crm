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
  RecurringEvent,
  RecurringEventUpdateOption
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
        const events = await api.events.list({
          start: filters.start,
          end: filters.end
        })
        this.events = events
      } catch (error) {
        this.error = error as Error
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async createEvent(event: NewCalendarEvent): Promise<CalendarEvent> {
      try {
        const eventData = {
          ...event,
          customerName: '', // Will be set by API
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: event.status || 'scheduled'
        }
        const newEvent = await api.events.create(eventData)
        this.events.push(newEvent)
        return newEvent
      } catch (error) {
        this.error = error as Error
        throw error
      }
    },

    async getEvent(id: string): Promise<CalendarEvent | null> {
      try {
        this.isLoading = true
        const event = await api.events.get(id)
        return event
      } catch (error) {
        this.error = error as Error
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async updateEventStatus(id: string, status: 'completed' | 'cancelled'): Promise<void> {
      try {
        this.isLoading = true
        const result = await api.events.updateStatus(id, status)
        
        // Update the event in the local store
        const index = this.events.findIndex(e => e.id === id)
        if (index !== -1) {
          this.events[index] = {
            ...this.events[index],
            status: result.status
          }
        }
      } catch (error) {
        this.error = error as Error
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async updateEvent(id: string, data: UpdateCalendarEvent): Promise<CalendarEvent> {
      try {
        const updatedEvent = await api.events.update(id, data)
        const index = this.events.findIndex(event => event.id === id)
        if (index !== -1) {
          this.events[index] = updatedEvent
        }
        return updatedEvent
      } catch (error) {
        this.error = error as Error
        throw error
      }
    },

    async deleteEvent(id: string): Promise<void> {
      try {
        await api.events.delete(id)
        this.events = this.events.filter(event => event.id !== id)
      } catch (error) {
        this.error = error as Error
        throw error
      }
    },

    async createRecurringEvent(
      event: NewCalendarEvent, 
      recurrence: EventRecurrence
    ): Promise<RecurringEvent> {
      try {
        const eventData = {
          ...event,
          customerName: '', // Will be set by API
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: event.status || 'scheduled',
          recurrence // API will handle this
        }
        const newEvent = await api.events.create(eventData) as RecurringEvent
        this.events.push(newEvent)
        return newEvent
      } catch (error) {
        this.error = error as Error
        throw error
      }
    },

    async updateRecurringEvent(
      eventId: string,
      data: UpdateCalendarEvent,
      option: RecurringEventUpdateOption
    ): Promise<void> {
      try {
        const updateData: UpdateCalendarEvent = {
          ...data,
          _recurringUpdate: option,
          updatedAt: new Date().toISOString()
        }
        const updatedEvent = await api.events.update(eventId, updateData)
        
        if (option === 'single') {
          const index = this.events.findIndex(event => event.id === eventId)
          if (index !== -1) {
            this.events[index] = updatedEvent
          }
        } else {
          await this.fetchEvents({
            start: new Date().toISOString(),
            end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: undefined,
            customerId: undefined,
            search: undefined
          })
        }
      } catch (error) {
        this.error = error as Error
        throw error
      }
    },

    async deleteRecurringEvent(
      eventId: string,
      option: RecurringEventUpdateOption
    ): Promise<void> {
      try {
        await api.events.delete(eventId)
        if (option === 'single') {
          this.events = this.events.filter(event => event.id !== eventId)
        } else {
          await this.fetchEvents({
            start: new Date().toISOString(),
            end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: undefined,
            customerId: undefined,
            search: undefined
          })
        }
      } catch (error) {
        this.error = error as Error
        throw error
      }
    },

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