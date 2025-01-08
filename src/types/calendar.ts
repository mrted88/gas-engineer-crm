// Basic Types
export type EventStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled' | 'deleted'
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'
export type ViewType = 'month' | 'week' | 'day' | 'agenda'

// Customer Interface
export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
}

// Time Slot Interface
export interface TimeSlot {
  start: string
  end: string
  available: boolean
  conflicts?: EventConflict[]
}

// Event Interfaces
export interface BaseEvent {
  id: string
  title: string
  date: Date | string
  time: string
  duration: number
  customerId: string
  customerName: string
  notes?: string
  status: EventStatus
  createdAt: string
  updatedAt: string
}

export interface CalendarEvent extends BaseEvent {
  startTime?: string
  endTime?: string
  color?: string
  isAllDay?: boolean
}

export interface RecurringEvent extends CalendarEvent {
  recurrence: EventRecurrence
  seriesId: string
  occurrence: number
  isException?: boolean
}

// Event Creation/Update Types
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
  updatedAt: string
}

// Recurrence Pattern
export interface EventRecurrence {
  frequency: RecurrenceFrequency
  interval: number
  endDate?: Date
  endAfterOccurrences?: number
  daysOfWeek?: number[]
  monthDay?: number
  weekNumber?: number
  exceptions?: Date[]
}

// Event Filters
export interface EventFilters {
  start: string
  end: string
  status?: EventStatus[]
  customerId?: string
  search?: string
}

// Conflict Checking
export interface EventConflict {
  eventId: string
  title: string
  time: string
  customerName: string
}

export interface ConflictCheckResult {
  exists: boolean
  conflicts?: EventConflict[]
}

// Validation
export interface EventValidation {
  isValid: boolean
  errors: string[]
}

// Calendar View Specific Types
export interface DayViewData {
  date: Date
  dayName: string
  dayNumber: string
  events: CalendarEvent[]
}

export interface WeekViewData {
  days: DayViewData[]
  startDate: Date
  endDate: Date
}

export interface MonthViewData {
  weeks: WeekViewData[]
  month: number
  year: number
}

// Event Group (for Agenda View)
export interface EventGroup {
  date: string
  events: CalendarEvent[]
}

// Drag and Drop
export interface DraggedEventData {
  event: CalendarEvent
  sourceDate: Date
  sourceHour: number
}

// API Response Types
export interface EventsResponse {
  events: CalendarEvent[]
  total: number
  hasMore: boolean
}

export interface AvailabilityResponse {
  date: string
  timeSlots: TimeSlot[]
}

// Error Types
export interface CalendarError extends Error {
  code?: string
  details?: unknown
}

// Store State Interface
export interface CalendarState {
  events: CalendarEvent[]
  loading: boolean
  error: CalendarError | null
  currentDate: Date
  currentView: ViewType
  selectedEvent: CalendarEvent | null
  filters: EventFilters
  availableTimeSlots: TimeSlot[]
}

// Store Actions
export interface CalendarActions {
  fetchEvents(filters: EventFilters): Promise<void>
  createEvent(event: NewCalendarEvent): Promise<CalendarEvent>
  updateEvent(id: string, updates: UpdateCalendarEvent): Promise<CalendarEvent>
  deleteEvent(id: string): Promise<void>
  checkAvailability(date: Date): Promise<AvailabilityResponse>
  checkConflicts(params: {
    date: string
    time: string
    duration: number
    excludeEventId?: string
  }): Promise<ConflictCheckResult>
}

// Utility Types
export type DateRange = {
  start: Date
  end: Date
}

export type TimeRange = {
  start: string
  end: string
}

export interface CalendarSettings {
  firstDayOfWeek: number
  workingHours: {
    start: number
    end: number
  }
  timeSlotDuration: number
  showWeekends: boolean
  defaultEventDuration: number
}

// Theme Types
export interface CalendarTheme {
  primary: string
  secondary: string
  success: string
  error: string
  warning: string
  surface: {
    1: string
    2: string
    3: string
  }
  text: {
    1: string
    2: string
    3: string
  }
  border: string
}

// Event Form State
export interface EventFormState {
  isOpen: boolean
  editingEvent: CalendarEvent | null
  isSubmitting: boolean
  hasConflict: boolean
  error: string | null
}

// Delete Modal State
export interface DeleteModalState {
  isOpen: boolean
  event: CalendarEvent | null
  isDeleting: boolean
  deleteOption: 'single' | 'future' | 'all'
}