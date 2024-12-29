// src/stores/customers.ts
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/services/api'

export const useCustomersStore = defineStore('customers', () => {
  const customers = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  async function fetchCustomers() {
    try {
      loading.value = true
      error.value = null
      const response = await api.customers.list()
      customers.value = response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch customers'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createCustomer(data: any) {
    try {
      loading.value = true
      error.value = null
      const response = await api.customers.create(data)
      customers.value.push(response)
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create customer'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateCustomer(id: string, data: any) {
    try {
      loading.value = true
      error.value = null
      const response = await api.customers.update(id, data)
      const index = customers.value.findIndex(c => c.id === id)
      if (index !== -1) {
        customers.value[index] = response
      }
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update customer'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteCustomer(id: string) {
    try {
      loading.value = true
      error.value = null
      await api.customers.delete(id)
      customers.value = customers.value.filter(c => c.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete customer'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer
  }
})