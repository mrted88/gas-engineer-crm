export interface CalendarEvent {
  id: string
  title: string
  date: Date
  startTime: string
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
  time: string // Format: "HH:mm"
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