import axios from 'axios'
import type { User, LoginCredentials, RegisterData } from '@/stores/auth'
import type { 
  CalendarEvent, 
  EventStatus, 
  EventSearchParams,
  TimeSlot,
  EventConflict,
  EventRecurrence,
  RecurringEvent,
  UpdateCalendarEvent
} from '@/types/event'

// Define base API configuration
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add request interceptor for auth token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      error: error.response?.data
    })

    if (error.response?.status === 401) {
      if (window.location.pathname !== '/login' && !localStorage.getItem('token')) {
        localStorage.setItem('redirectPath', window.location.pathname)
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Interfaces
export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
}

interface EventsApi {
  _mockEvents: CalendarEvent[]
  _saveMockEvents(): void
  list(params: { start: string; end: string }): Promise<CalendarEvent[]>
  create(data: Omit<CalendarEvent, 'id'> & { 
    recurrence?: EventRecurrence 
  }): Promise<CalendarEvent | RecurringEvent>
  update(id: string, data: UpdateCalendarEvent): Promise<CalendarEvent>
  delete(id: string): Promise<void>
  updateStatus(id: string, status: EventStatus): Promise<{ id: string; status: EventStatus }>
  get(id: string): Promise<CalendarEvent>
  search(params: EventSearchParams): Promise<CalendarEvent[]>
}

// Mock customers for development
const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    phone: '07700 900000',
    address: '123 Main St'
  },
  {
    id: '2',
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '07700 900001',
    address: '456 High St'
  },
  {
    id: '3',
    name: 'Bob Wilson',
    email: 'bob@example.com',
    phone: '07700 900002',
    address: '789 Park Road'
  },
  {
    id: '4',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    phone: '07700 900003',
    address: '321 Church Lane'
  },
  {
    id: '5',
    name: 'Mike Brown',
    email: 'mike@example.com',
    phone: '07700 900004',
    address: '654 Queen Street'
  }
]

export const api = {
  auth: {
    async login(email: string, password: string) {
      if (email === 'test@example.com' && password === 'password123') {
        return {
          user: {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            role: 'admin'
          },
          token: 'test-token-123'
        }
      }
      const response = await axiosInstance.post('/auth/login', { email, password })
      return response.data
    },

    async register(data: RegisterData) {
      const response = await axiosInstance.post('/auth/register', data)
      return response.data
    },

    async getProfile() {
      const response = await axiosInstance.get('/auth/me')
      return response.data
    },

    async updateProfile(data: Partial<User>) {
      const response = await axiosInstance.put('/auth/profile', data)
      return response.data
    },

    async changePassword(data: { currentPassword: string; newPassword: string }) {
      const response = await axiosInstance.post('/auth/change-password', data)
      return response.data
    },
  },

  events: {
    _mockEvents: (() => {
      const saved = localStorage.getItem('mockEvents')
      return saved ? JSON.parse(saved) : []
    })() as CalendarEvent[],

    _saveMockEvents() {
      localStorage.setItem('mockEvents', JSON.stringify(this._mockEvents))
    },

    async list(params: { start: string; end: string }) {
      try {
        if (this._mockEvents.length === 0) {
          const defaultEvent = {
            id: '1',
            title: 'Boiler Service',
            date: new Date('2024-01-15'),
            startTime: '09:00',
            time: '09:00',
            duration: 60,
            customerId: '1',
            customerName: 'John Smith',
            status: 'scheduled' as EventStatus,
            notes: 'Annual service',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          this._mockEvents.push(defaultEvent)
          this._saveMockEvents()
        }
        // Filter events based on date range
        return this._mockEvents.filter(event => {
          const eventDate = new Date(event.date)
          return eventDate >= new Date(params.start) && eventDate <= new Date(params.end)
        })
      } catch (error) {
        console.error('Error listing events:', error)
        throw error
      }
    },

    async get(id: string) {
      const event = this._mockEvents.find(e => e.id === id)
      if (!event) throw new Error('Event not found')
      return event
    },

    async create(data: Omit<CalendarEvent, 'id'> & { recurrence?: EventRecurrence }) {
      const customer = mockCustomers.find(c => c.id === data.customerId)
      const newEvent = {
        id: Date.now().toString(),
        ...data,
        date: new Date(data.date),
        startTime: data.time,
        customerName: customer?.name || 'Unknown Customer',
        status: data.status || 'scheduled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Handle recurring events
      if (data.recurrence) {
        const recurringEvent = {
          ...newEvent,
          recurrence: data.recurrence
        } as RecurringEvent
        this._mockEvents.push(recurringEvent)
        this._saveMockEvents()
        return recurringEvent
      }

      this._mockEvents.push(newEvent)
      this._saveMockEvents()
      return newEvent
    },

    async update(id: string, data: UpdateCalendarEvent) {
      const index = this._mockEvents.findIndex(e => e.id === id)
      if (index === -1) throw new Error('Event not found')
      
      // Handle recurring event updates
      if (data._recurringUpdate) {
        const event = this._mockEvents[index] as RecurringEvent
        if (event.recurrence) {
          switch (data._recurringUpdate) {
            case 'single':
              // Update only this instance
              this._mockEvents[index] = {
                ...event,
                ...data,
                updatedAt: new Date().toISOString()
              }
              break
            case 'future':
              // Update this and all future instances
              this._mockEvents = this._mockEvents.map(e => {
                if (e.parentEventId === event.id && new Date(e.date) >= new Date(event.date)) {
                  return {
                    ...e,
                    ...data,
                    updatedAt: new Date().toISOString()
                  }
                }
                return e
              })
              break
            case 'all':
              // Update all instances
              this._mockEvents = this._mockEvents.map(e => {
                if (e.parentEventId === event.id || e.id === event.id) {
                  return {
                    ...e,
                    ...data,
                    updatedAt: new Date().toISOString()
                  }
                }
                return e
              })
              break
          }
        }
      } else {
        // Regular event update
        this._mockEvents[index] = {
          ...this._mockEvents[index],
          ...data,
          date: new Date(data.date || this._mockEvents[index].date),
          updatedAt: new Date().toISOString()
        }
      }
      
      this._saveMockEvents()
      return this._mockEvents[index]
    },

    async delete(id: string) {
      const event = this._mockEvents.find(e => e.id === id) as RecurringEvent
      const initialLength = this._mockEvents.length
      
      if (event?.recurrence) {
        // Remove all related recurring events
        this._mockEvents = this._mockEvents.filter(e => 
          e.id !== id && e.parentEventId !== id
        )
      } else {
        // Remove single event
        this._mockEvents = this._mockEvents.filter(e => e.id !== id)
      }

      if (this._mockEvents.length === initialLength) {
        throw new Error('Event not found')
      }
      this._saveMockEvents()
    },

    async updateStatus(id: string, status: EventStatus) {
      const index = this._mockEvents.findIndex(e => e.id === id)
      if (index === -1) throw new Error('Event not found')
      
      this._mockEvents[index].status = status
      this._mockEvents[index].updatedAt = new Date().toISOString()
      this._saveMockEvents()
      return { id, status }
    },

    async search(params: EventSearchParams) {
      return this._mockEvents.filter(event => {
        if (params.query) {
          const searchTerm = params.query.toLowerCase()
          if (!event.title.toLowerCase().includes(searchTerm) &&
              !event.customerName.toLowerCase().includes(searchTerm)) {
            return false
          }
        }
        if (params.status && event.status !== params.status) return false
        if (params.customerId && event.customerId !== params.customerId) return false
        if (params.startDate && new Date(event.date) < new Date(params.startDate)) return false
        if (params.endDate && new Date(event.date) > new Date(params.endDate)) return false
        return true
      })
    }
  } as EventsApi,

  customers: {
    async list() {
      return mockCustomers
    },

    async get(id: string) {
      const customer = mockCustomers.find(c => c.id === id)
      if (!customer) throw new Error('Customer not found')
      return customer
    },

    async create(data: Omit<Customer, 'id'>) {
      const response = await axiosInstance.post('/customers', data)
      return response.data
    },

    async update(id: string, data: Partial<Customer>) {
      const response = await axiosInstance.put(`/customers/${id}`, data)
      return response.data
    },

    async delete(id: string) {
      await axiosInstance.delete(`/customers/${id}`)
    },

    async search(query: string) {
      const response = await axiosInstance.get(`/customers/search?q=${encodeURIComponent(query)}`)
      return response.data
    },
  }
}

export type Api = typeof api