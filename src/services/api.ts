import type { User, LoginCredentials, RegisterData } from '@/stores/auth'
import type { 
  CalendarEvent, 
  EventStatus, 
  EventSearchParams 
} from '@/types/event'

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
  list(params?: { start: string; end: string }): Promise<CalendarEvent[]>
  create(data: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent>
  update(id: string, data: Partial<CalendarEvent>): Promise<CalendarEvent>
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

// Helper function to handle API responses with improved error handling
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    // Check if the response is HTML (usually means the API server is down/unreachable)
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('text/html')) {
      console.warn('Received HTML response instead of JSON - API might be unavailable')
      throw new Error('API unavailable')
    }

    const error = await response.json().catch(() => ({}))
    console.error('API Error:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      error
    })
    
    // Handle 401 unauthorized errors
    if (response.status === 401) {
      console.warn('Authentication error detected', {
        path: window.location.pathname,
        isLoginPage: window.location.pathname === '/login',
        hasToken: !!localStorage.getItem('token'),
        isJobPage: window.location.pathname.includes('/jobs/')
      })
      
      // Never redirect if we're on a job details page
      if (window.location.pathname.includes('/jobs/')) {
        console.log('On job details page, not redirecting')
        throw new Error('Authentication required')
      }
      
      // Only redirect if not on login and no token
      if (window.location.pathname !== '/login' && !localStorage.getItem('token')) {
        localStorage.setItem('redirectPath', window.location.pathname)
        console.log('Redirecting to login page')
        window.location.href = '/login'
      }
    }
    
    throw new Error(error.message || `API request failed: ${response.statusText}`)
  }

  try {
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('text/html')) {
      console.warn('Received HTML response instead of JSON - API might be unavailable')
      throw new Error('API unavailable')
    }
    return await response.json()
  } catch (error) {
    console.error('Error parsing JSON response:', error)
    // Don't reset auth state for parsing errors
    throw new Error('API unavailable')
  }
}

// Helper function to get headers with auth token and logging
function getHeaders(includeAuth: boolean = true) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  if (includeAuth) {
    const token = localStorage.getItem('token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
      console.log('Adding token to request')
    } else {
      console.warn('No token found for authenticated request')
    }
  }
  
  return headers
}

export const api = {
  auth: {
    async login(email: string, password: string) {
      console.log('API: Login attempt for:', email)
      // For development/testing
      if (email === 'test@example.com' && password === 'password123') {
        const mockResponse = {
          user: {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            role: 'admin'
          },
          token: 'test-token-123'
        }
        console.log('API: Mock login successful')
        return mockResponse
      }

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: getHeaders(false),
          body: JSON.stringify({ email, password }),
        })
        return handleResponse<{ user: User; token: string }>(response)
      } catch (error) {
        console.error('Login error:', error)
        throw error
      }
    },

    async register(data: RegisterData) {
      console.log('API: Register attempt')
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: getHeaders(false),
        body: JSON.stringify(data),
      })
      return handleResponse<{ user: User; token: string }>(response)
    },

    async getProfile() {
      console.log('API: Fetching user profile')
      const response = await fetch('/api/auth/me', {
        headers: getHeaders(),
      })
      return handleResponse<User>(response)
    },

    async updateProfile(data: Partial<User>) {
      console.log('API: Updating user profile')
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      })
      return handleResponse<User>(response)
    },

    async changePassword(data: { currentPassword: string; newPassword: string }) {
      console.log('API: Changing password')
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      })
      return handleResponse<{ message: string }>(response)
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

    async list(params?: { start: string; end: string }) {
      console.log('API: Listing events with params:', params)
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
        return Promise.resolve(this._mockEvents)
      } catch (error) {
        console.error('Error listing events:', error)
        throw error
      }
    },

    async get(id: string) {
      console.log('API: Getting event:', id, {
        currentPath: window.location.pathname,
        mockEventsCount: this._mockEvents.length,
        savedEvents: localStorage.getItem('mockEvents')
      })
      
      try {
        // First try to get from localStorage
        const savedEvents = localStorage.getItem('mockEvents')
        if (savedEvents) {
          const events = JSON.parse(savedEvents)
          const event = events.find((e: CalendarEvent) => e.id === id)
          if (event) {
            console.log('Found event in localStorage:', event)
            return Promise.resolve(event)
          }
        }
    
        // Then try to get from memory
        const event = this._mockEvents.find(e => e.id === id)
        if (event) {
          console.log('Found event in memory:', event)
          return Promise.resolve(event)
        }
    
        console.warn('Event not found:', id)
        throw new Error('Event not found')
      } catch (error) {
        console.error('Error getting event:', error)
        throw error
      }
    },

    async create(data: Omit<CalendarEvent, 'id'>) {
      console.log('API: Creating event with data:', data)
      try {
        const customer = mockCustomers.find(c => c.id === data.customerId)
        const newEvent = {
          id: Date.now().toString(),
          ...data,
          date: new Date(data.date),
          startTime: data.time,
          customerName: customer?.name || 'Unknown Customer',
          status: 'scheduled' as EventStatus,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        this._mockEvents.push(newEvent)
        this._saveMockEvents()
        return Promise.resolve(newEvent)
      } catch (error) {
        console.error('Error creating event:', error)
        throw error
      }
    },

    async update(id: string, data: Partial<CalendarEvent>) {
      console.log('API: Updating event:', id, data)
      try {
        const index = this._mockEvents.findIndex(e => e.id === id)
        if (index === -1) {
          throw new Error('Event not found')
        }
        
        this._mockEvents[index] = {
          ...this._mockEvents[index],
          ...data,
          date: new Date(data.date || this._mockEvents[index].date),
          updatedAt: new Date().toISOString()
        }
        
        this._saveMockEvents()
        return Promise.resolve(this._mockEvents[index])
      } catch (error) {
        console.error('Error updating event:', error)
        throw error
      }
    },

    async delete(id: string) {
      console.log('API: Deleting event:', id)
      try {
        const initialLength = this._mockEvents.length
        this._mockEvents = this._mockEvents.filter(e => e.id !== id)
        
        if (this._mockEvents.length === initialLength) {
          throw new Error('Event not found')
        }
        
        this._saveMockEvents()
        return Promise.resolve()
      } catch (error) {
        console.error('Error deleting event:', error)
        throw error
      }
    },

    async updateStatus(id: string, status: EventStatus) {
      console.log('API: Updating event status:', id, status)
      try {
        const index = this._mockEvents.findIndex(e => e.id === id)
        if (index === -1) {
          throw new Error('Event not found')
        }
        
        this._mockEvents[index].status = status
        this._mockEvents[index].updatedAt = new Date().toISOString()
        this._saveMockEvents()
        return Promise.resolve({ id, status })
      } catch (error) {
        console.error('Error updating event status:', error)
        throw error
      }
    },

    async search(params: EventSearchParams) {
      console.log('API: Searching events with params:', params)
      try {
        const filteredEvents = this._mockEvents.filter(event => {
          if (params.query) {
            const searchTerm = params.query.toLowerCase()
            if (!event.title.toLowerCase().includes(searchTerm) &&
                !event.customerName.toLowerCase().includes(searchTerm)) {
              return false
            }
          }
          if (params.status && event.status !== params.status) {
            return false
          }
          if (params.customerId && event.customerId !== params.customerId) {
            return false
          }
          if (params.startDate && new Date(event.date) < new Date(params.startDate)) {
            return false
          }
          if (params.endDate && new Date(event.date) > new Date(params.endDate)) {
            return false
          }
          return true
        })
        
        return Promise.resolve(filteredEvents)
      } catch (error) {
        console.error('Error searching events:', error)
        throw error
      }
    }
  } as EventsApi,

  customers: {
    async list() {
      console.log('API: Listing customers')
      return Promise.resolve(mockCustomers)
    },

    async get(id: string) {
      console.log('API: Getting customer:', id)
      const customer = mockCustomers.find(c => c.id === id)
      if (!customer) {
        throw new Error('Customer not found')
      }
      return Promise.resolve(customer)
    },

    async create(data: Omit<Customer, 'id'>) {
      console.log('API: Creating customer:', data)
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      })
      return handleResponse<Customer>(response)
    },

    async update(id: string, data: Partial<Customer>) {
      console.log('API: Updating customer:', id, data)
      const response = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      })
      return handleResponse<Customer>(response)
    },

    async delete(id: string) {
      console.log('API: Deleting customer:', id)
      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
      return handleResponse<void>(response)
    },

    async search(query: string) {
      console.log('API: Searching customers:', query)
      const response = await fetch(`/api/customers/search?q=${encodeURIComponent(query)}`, {
        headers: getHeaders(),
      })
      return handleResponse<Customer[]>(response)
    },
  }
}

export type Api = typeof api