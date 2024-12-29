// src/services/api.ts
import type { User, LoginCredentials, RegisterData } from '@/stores/auth'

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
      const response = await fetch('/api/customers', {
        headers: getHeaders(),
      })

      return handleResponse<any[]>(response)
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
    async list(params?: { start: string; end: string }) {
      const queryString = params 
        ? `?start=${params.start}&end=${params.end}` 
        : ''
      
      const response = await fetch(`/api/events${queryString}`, {
        headers: getHeaders(),
      })

      return handleResponse<any[]>(response)
    },

    async create(data: any) {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      })

      return handleResponse<any>(response)
    },

    async update(id: string, data: any) {
      const response = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      })

      return handleResponse<any>(response)
    },

    async delete(id: string) {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })

      return handleResponse<void>(response)
    },

    async updateStatus(id: string, status: string) {
      const response = await fetch(`/api/events/${id}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      })

      return handleResponse<any>(response)
    },
  },
}

export type Api = typeof api