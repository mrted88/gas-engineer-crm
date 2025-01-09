// Basic event types
export type EventStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled' | 'deleted'

export interface CalendarEvent {
  id: string
  title: string
  date: string | Date
  time: string
  startTime?: string
  duration: number
  customerId: string
  customerName: string
  status: EventStatus
  notes?: string
  createdAt: string
  updatedAt: string
  stopPropagation?: () => void
  parentEventId?: string
}

export interface NewCalendarEvent {
  title: string
  date: Date
  time: string
  duration: number
  customerId: string
  notes?: string
  status?: EventStatus
}

export interface UpdateCalendarEvent extends Partial<NewCalendarEvent> {
  updatedAt?: string
  _recurringUpdate?: 'single' | 'future' | 'all'
  parentEventId?: string
}

// Recurring event types
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface EventRecurrence {
  frequency: RecurrenceFrequency
  interval: number
  endDate?: Date
  endAfterOccurrences?: number
}

export interface RecurringEvent extends CalendarEvent {
  recurrence: EventRecurrence
  parentEventId?: string
  occurrenceNumber?: number
}

// API response types
export interface EventResponse {
  data: CalendarEvent
  message: string
}

export interface EventsResponse {
  data: CalendarEvent[]
  meta?: {
    total: number
    page: number
    perPage: number
  }
}

// Filter and search types
export interface EventFilters {
  start: string
  end: string
  customerId?: string
  status?: EventStatus
  search?: string
}

export interface EventSearchParams {
  query?: string
  status?: EventStatus
  customerId?: string
  startDate?: string
  endDate?: string
  time?: string // Added this
}

// Availability and conflict types
export interface TimeSlot {
  start: string
  end: string
  available: boolean
}

export interface TimeSlotConflict {
  eventId: string
  title: string
  time: string
  duration: number
}

export interface EventConflict {
  exists: boolean
  conflictingEvents?: CalendarEvent[]
}

export interface EventAvailability {
  date: string
  timeSlots: TimeSlot[]
}

// Validation types
export interface EventValidation {
  isValid: boolean
  errors: string[]
}

// Event update options
export type RecurringEventUpdateOption = 'single' | 'future' | 'all'

// Event drag and drop types
export interface EventDragInfo {
  eventId: string
  newDate: Date
  newTime: string
}

// Event view types
export type CalendarViewType = 'month' | 'week' | 'day' | 'agenda'

// Event date helpers
export interface CalendarDay {
  date: Date
  dayNumber: string
  isCurrentMonth: boolean
}

export interface WeekDay {
  date: Date
  dayName: string
  dayNumber: string
}

// Event styling
export interface EventStyles {
  top: string
  height: string
  position: 'absolute'
  left: string
  right: string
  zIndex: number
}

// Event form state
export interface EventFormState {
  title: string
  date: Date
  time: string
  duration: number
  customerId: string
  notes?: string
  status?: EventStatus
  recurrence?: EventRecurrence
}

// Event error types
export interface EventError {
  message: string
  code?: string
  field?: string
}

// Event notification types
export interface EventNotification {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}