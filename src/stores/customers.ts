import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/services/api'
import type { Customer } from '@/types/customer'

export const useCustomersStore = defineStore('customers', () => {
  const customers = ref<Customer[]>([])
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

  async function getCustomer(id: string) {
    try {
      loading.value = true
      error.value = null
      // First check if we already have the customer in our store
      const existingCustomer = customers.value.find(c => c.id === id)
      if (existingCustomer) {
        return existingCustomer
      }
      // If not found in store, fetch from API
      const customer = await api.customers.get(id)
      return customer
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch customer'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createCustomer(data: Omit<Customer, 'id'>) {
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

  async function updateCustomer(id: string, data: Partial<Customer>) {
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
    getCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer
  }
})