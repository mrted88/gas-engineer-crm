import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/services/api'

// Define interfaces
interface User {
  id: string
  name: string
  email: string
  role: string
}

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
}

interface ProfileUpdateData {
  firstName?: string
  lastName?: string
  email?: string
}

interface PasswordChangeData {
  currentPassword: string
  newPassword: string
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  // Actions
  async function login(credentials: LoginCredentials) {
    try {
      loading.value = true
      error.value = null
      console.log('Attempting login...')
      const response = await api.auth.login(credentials.email, credentials.password)
      user.value = response.user
      token.value = response.token
      localStorage.setItem('token', response.token)
      console.log('Login successful')
      return response
    } catch (err) {
      console.error('Login failed:', err)
      error.value = err instanceof Error ? err.message : 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(data: RegisterData) {
    try {
      loading.value = true
      error.value = null
      const response = await api.auth.register(data)
      user.value = response.user
      token.value = response.token
      localStorage.setItem('token', response.token)
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Registration failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      loading.value = true
      console.log('Logging out...')
      // Optional: Call logout endpoint if your API has one
      // await api.auth.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      resetState()
      loading.value = false
    }
  }

  async function checkAuth() {
    const savedToken = localStorage.getItem('token')
    if (!savedToken) {
      console.log('No token found during auth check')
      return
    }
  
    try {
      loading.value = true
      token.value = savedToken
      console.log('Checking authentication...')
      const userData = await api.auth.getProfile()
      user.value = userData
      console.log('Auth check successful')
    } catch (err) {
      console.error('Auth check failed:', err)
      // Only reset state for actual auth failures, not API availability issues
      if (err instanceof Error && err.message !== 'API unavailable') {
        resetState()
      }
    } finally {
      loading.value = false
    }
  }

  async function updateProfile(data: ProfileUpdateData) {
    try {
      loading.value = true
      error.value = null
      const updatedUser = await api.auth.updateProfile(data)
      user.value = updatedUser
      return updatedUser
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Profile update failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function changePassword(data: PasswordChangeData) {
    try {
      loading.value = true
      error.value = null
      await api.auth.changePassword(data)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Password change failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  function init() {
    console.log('Initializing auth store')
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      console.log('Found saved token')
      token.value = savedToken
      checkAuth().catch(err => {
        console.error('Init auth check failed:', err)
        // Only reset state for actual auth failures, not API availability issues
        if (err instanceof Error && err.message !== 'API unavailable') {
          resetState()
        }
      })
    }
  }

  function resetState() {
    console.log('Resetting auth state')
    user.value = null
    token.value = null
    loading.value = false
    error.value = null
    localStorage.removeItem('token')
  }

  return {
    // State
    user,
    token,
    loading,
    error,
    // Getters
    isAuthenticated,
    isAdmin,
    // Actions
    login,
    register,
    logout,
    checkAuth,
    updateProfile,
    changePassword,
    init,
    resetState
  }
})

// Export types
export type { User, LoginCredentials, RegisterData, ProfileUpdateData, PasswordChangeData }