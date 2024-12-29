// src/services/api.ts
import type { User, LoginCredentials, RegisterData } from '@/stores/auth'

// Mock customers for development
const mockCustomers = [
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
    // Create a mock events array to persist data during development
    _mockEvents: [] as any[],

    async list(params?: { start: string; end: string }) {
      // For development/testing
      console.log('API: Listing events with params:', params)
      return Promise.resolve(this._mockEvents.length > 0 ? this._mockEvents : [
        {
          id: '1',
          title: 'Boiler Service',
          date: new Date('2024-01-15'),
          startTime: '09:00',
          duration: 60,
          customerId: '1',
          customerName: 'John Smith',
          status: 'scheduled' as const,
          notes: 'Annual service',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ])
    },

    async create(data: any) {
      // For development/testing
      console.log('API: Creating event with data:', data)
      const customer = mockCustomers.find(c => c.id === data.customerId)
      const newEvent = {
        id: Date.now().toString(),
        ...data,
        date: new Date(data.date),
        startTime: data.time,  // Make sure this is set
        customerName: customer?.name || 'Unknown Customer',
        status: 'scheduled' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      this._mockEvents.push(newEvent)
      console.log('API: Current mock events:', this._mockEvents)
      return Promise.resolve(newEvent)
    },

    async update(id: string, data: any) {
      // For development/testing
      console.log('API: Updating event:', id, data)
      const index = this._mockEvents.findIndex(e => e.id === id)
      if (index !== -1) {
        this._mockEvents[index] = {
          ...this._mockEvents[index],
          ...data,
          date: new Date(data.date),
          status: (data.status || 'scheduled') as 'scheduled' | 'completed' | 'cancelled',
          updatedAt: new Date().toISOString()
        }
      }
      return Promise.resolve(this._mockEvents[index])
    },

    async delete(id: string) {
      // For development/testing
      console.log('API: Deleting event:', id)
      this._mockEvents = this._mockEvents.filter(e => e.id !== id)
      return Promise.resolve()
    },

    async updateStatus(id: string, status: 'scheduled' | 'completed' | 'cancelled') {
      // For development/testing
      console.log('API: Updating event status:', id, status)
      const index = this._mockEvents.findIndex(e => e.id === id)
      if (index !== -1) {
        this._mockEvents[index].status = status
      }
      return Promise.resolve({ id, status })
    },
  }
}

export type Api = typeof api