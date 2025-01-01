// Event status type
export type EventStatus = 'scheduled' | 'completed' | 'cancelled'

// Main Calendar Event Interface
export interface CalendarEvent {
  id: string
  title: string
  date: Date | string
  time: string
  startTime?: string
  duration: number
  customerId: string
  customerName: string
  status: EventStatus
  notes?: string
  createdAt: string
  updatedAt: string
}

// Interface for creating new events
export interface NewCalendarEvent {
  title: string
  date: Date
  time: string
  duration: number
  customerId: string
  notes?: string
}

// Interface for updating events
export interface UpdateCalendarEvent extends Partial<Omit<CalendarEvent, 'id'>> {
  updatedAt?: string
}

// Filter interfaces
export interface EventFilters {
  start: string
  end: string
  status?: EventStatus
  customerId?: string
}

// Response interfaces
export interface EventResponse {
  success: boolean
  data: CalendarEvent
  message?: string
}

export interface EventsResponse {
  success: boolean
  data: CalendarEvent[]
  message?: string
}

// Event validation interface
export interface EventValidation {
  isValid: boolean
  errors: string[]
}

// Event time slot interface
export interface TimeSlot {
  start: string
  end: string
  available: boolean
}

// Event statistics interface
export interface EventStats {
  total: number
  completed: number
  cancelled: number
  scheduled: number
  averageDuration: number
}

// Event search params
export interface EventSearchParams {
  query?: string
  startDate?: string
  endDate?: string
  status?: EventStatus
  customerId?: string
  limit?: number
  offset?: number
}

// Event sort options
export type EventSortField = 'date' | 'time' | 'status' | 'customerName'
export type EventSortOrder = 'asc' | 'desc'

export interface EventSortOptions {
  field: EventSortField
  order: EventSortOrder
}

// Utility type for event grouping
export type GroupedEvents = Record<string, CalendarEvent[]>

// Event notification interface
export interface EventNotification {
  eventId: string
  type: 'reminder' | 'update' | 'cancellation'
  message: string
  sentAt: string
  status: 'pending' | 'sent' | 'failed'
}

// Event recurrence pattern
export interface EventRecurrence {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number
  endDate?: string
  endAfterOccurrences?: number
}

// Event with recurrence
export interface RecurringEvent extends CalendarEvent {
  recurrence?: EventRecurrence
  parentEventId?: string
}

// Event conflict check
export interface EventConflict {
  exists: boolean
  conflictingEvents: CalendarEvent[]
}

// Event availability check
export interface EventAvailability {
  date: string
  timeSlots: TimeSlot[]
}