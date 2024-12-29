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
      
      const response = await api.auth.login(credentials.email, credentials.password)
      
      user.value = response.user
      token.value = response.token
      localStorage.setItem('token', response.token)
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(userData: RegisterData) {
    try {
      loading.value = true
      error.value = null
      
      const response = await api.auth.register(userData)
      
      user.value = response.user
      token.value = response.token
      localStorage.setItem('token', response.token)
      
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
      // Optional: Call logout endpoint if you have one
      // await api.auth.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      user.value = null
      token.value = null
      localStorage.removeItem('token')
      loading.value = false
    }
  }

  async function checkAuth() {
    const savedToken = localStorage.getItem('token')
    if (!savedToken) {
      return
    }

    try {
      loading.value = true
      token.value = savedToken
      
      const userData = await api.auth.getProfile()
      user.value = userData
      
    } catch (err) {
      console.error('Auth check failed:', err)
      await logout()
    } finally {
      loading.value = false
    }
  }

  async function updateProfile(profileData: Partial<User>) {
    try {
      loading.value = true
      error.value = null
      
      const updatedUser = await api.auth.updateProfile(profileData)
      user.value = updatedUser
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Profile update failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    try {
      loading.value = true
      error.value = null
      
      await api.auth.changePassword({
        currentPassword,
        newPassword
      })
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Password change failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Initialize auth state
  function init() {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      token.value = savedToken
      checkAuth()
    }
  }

  // Reset store state
  function resetState() {
    user.value = null
    token.value = null
    loading.value = false
    error.value = null
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
export type { User, LoginCredentials, RegisterData }