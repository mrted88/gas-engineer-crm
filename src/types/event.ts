// In your types/event.ts file
// src/types/event.ts
export interface CalendarEvent {
  id: string
  title: string
  date: Date
  time: string  // Changed from optional to required
  startTime?: string
  duration: number
  customerId: string
  customerName: string
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface NewCalendarEvent {
  title: string
  date: Date
  time: string  // Changed from optional to required
  duration: number
  customerId: string
  notes?: string
}

// Optional: Add these if you need them for type safety
export type EventStatus = 'scheduled' | 'completed' | 'cancelled'

export interface EventFilters {
  start: string
  end: string
}