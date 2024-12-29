// src/stores/events.ts
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/services/api'
import type { CalendarEvent } from '@/types/event'

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

  async function createEvent(data: Partial<CalendarEvent>) {
    try {
      loading.value = true
      error.value = null
      console.log('Store: Creating event with data:', data)
      const response = await api.events.create(data)
      console.log('Store: Received response:', response)
      events.value.push(response)
      console.log('Store: Updated events array:', events.value)
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create event'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateEvent(id: string, data: Partial<CalendarEvent>) {
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

  async function updateEventStatus(id: string, status: 'scheduled' | 'completed' | 'cancelled') {
    try {
      loading.value = true
      error.value = null
      const response = await api.events.updateStatus(id, status)
      const index = events.value.findIndex(e => e.id === id)
      if (index !== -1) {
        events.value[index] = { ...events.value[index], status: response.status }
      }
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update event status'
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
    updateEventStatus
  }
})