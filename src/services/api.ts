import type { User, LoginCredentials, RegisterData } from '@/stores/auth'
import type { 
  CalendarEvent, 
  EventStatus, 
  EventSearchParams 
} from '@/types/event'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
}

interface EventsApi {
  _mockEvents: CalendarEvent[]
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

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || 'API request failed')
  }
  return response.json()
}

// Helper function to get headers with auth token
function getHeaders(includeAuth: boolean = true) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  if (includeAuth) {
    const token = localStorage.getItem('token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }
  
  return headers
}

export const api = {
  auth: {
    async login(email: string, password: string) {
      // For development/testing
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

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: getHeaders(false),
        body: JSON.stringify({ email, password }),
      })

      return handleResponse<{ user: User; token: string }>(response)
    },

    async register(data: RegisterData) {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: getHeaders(false),
        body: JSON.stringify(data),
      })

      return handleResponse<{ user: User; token: string }>(response)
    },

    async getProfile() {
      const response = await fetch('/api/auth/me', {
        headers: getHeaders(),
      })

      return handleResponse<User>(response)
    },

    async updateProfile(data: Partial<User>) {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      })

      return handleResponse<User>(response)
    },

    async changePassword(data: { currentPassword: string; newPassword: string }) {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      })

      return handleResponse<{ message: string }>(response)
    },

    async forgotPassword(email: string) {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: getHeaders(false),
        body: JSON.stringify({ email }),
      })

      return handleResponse<{ message: string }>(response)
    },

    async resetPassword(token: string, password: string) {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: getHeaders(false),
        body: JSON.stringify({ token, password }),
      })

      return handleResponse<{ message: string }>(response)
    },
  },

  customers: {
    async list() {
      // For development/testing
      return Promise.resolve(mockCustomers)
    },

    async get(id: string) {
      // For development/testing
      const customer = mockCustomers.find(c => c.id === id)
      if (!customer) {
        throw new Error('Customer not found')
      }
      return Promise.resolve(customer)
    },

    async create(data: any) {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      })

      return handleResponse<any>(response)
    },

    async update(id: string, data: any) {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      })

      return handleResponse<any>(response)
    },

    async delete(id: string) {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })

      return handleResponse<void>(response)
    },

    async search(query: string) {
      const response = await fetch(`/api/customers/search?q=${encodeURIComponent(query)}`, {
        headers: getHeaders(),
      })

      return handleResponse<any[]>(response)
    },
},

  events: {
    _mockEvents: [] as CalendarEvent[],

    async list(params?: { start: string; end: string }) {
      console.log('API: Listing events with params:', params)
      return Promise.resolve(this._mockEvents.length > 0 ? this._mockEvents : [
        {
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
      ])
    },

    async get(id: string) {
      console.log('API: Getting event:', id)
      const event = this._mockEvents.find(e => e.id === id)
      if (!event) {
        // Return mock data if event not found
        return Promise.resolve({
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
        })
      }
      return Promise.resolve(event)
    },

    async create(data: Omit<CalendarEvent, 'id'>) {
      console.log('API: Creating event with data:', data)
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
      console.log('API: Current mock events:', this._mockEvents)
      return Promise.resolve(newEvent)
    },

    async update(id: string, data: Partial<CalendarEvent>) {
      console.log('API: Updating event:', id, data)
      const index = this._mockEvents.findIndex(e => e.id === id)
      if (index !== -1) {
        this._mockEvents[index] = {
          ...this._mockEvents[index],
          ...data,
          date: new Date(data.date || this._mockEvents[index].date),
          updatedAt: new Date().toISOString()
        }
      }
      return Promise.resolve(this._mockEvents[index])
    },

    async delete(id: string) {
      console.log('API: Deleting event:', id)
      this._mockEvents = this._mockEvents.filter(e => e.id !== id)
      return Promise.resolve()
    },

    async updateStatus(id: string, status: EventStatus) {
      console.log('API: Updating event status:', id, status)
      const index = this._mockEvents.findIndex(e => e.id === id)
      if (index !== -1) {
        this._mockEvents[index].status = status
      }
      return Promise.resolve({ id, status })
    },

    async search(params: EventSearchParams) {
      console.log('API: Searching events with params:', params)
      return this._mockEvents.filter(event => {
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
    }
  } as EventsApi
}

export type Api = typeof api