import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/services/api'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  notes?: string
  createdAt: string
  updatedAt: string
}

interface NewCustomer {
  name: string
  email: string
  phone: string
  address: string
  notes?: string
}

export const useCustomersStore = defineStore('customers', () => {
  // State
  const customers = ref<Customer[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const selectedCustomer = ref<Customer | null>(null)

  // Getters
  const sortedCustomers = computed(() => {
    return [...customers.value].sort((a, b) => a.name.localeCompare(b.name))
  })

  const getCustomerById = computed(() => (id: string) => {
    return customers.value.find(c => c.id === id)
  })

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

  async function createCustomer(customerData: NewCustomer) {
    try {
      loading.value = true
      error.value = null
      const response = await api.customers.create(customerData)
      customers.value.push(response)
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create customer'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateCustomer(id: string, customerData: Partial<Customer>) {
    try {
      loading.value = true
      error.value = null
      const response = await api.customers.update(id, customerData)
      const index = customers.value.findIndex(c => c.id === id)
      if (index !== -1) {
        customers.value[index] = response
      }
      if (selectedCustomer.value?.id === id) {
        selectedCustomer.value = response
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
      if (selectedCustomer.value?.id === id) {
        selectedCustomer.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete customer'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function searchCustomers(query: string) {
    try {
      loading.value = true
      error.value = null
      const response = await api.customers.search(query)
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to search customers'
      throw err
    } finally {
      loading.value = false
    }
  }

  function selectCustomer(customer: Customer | null) {
    selectedCustomer.value = customer
  }

  function resetState() {
    customers.value = []
    loading.value = false
    error.value = null
    selectedCustomer.value = null
  }

  return {
    // State
    customers,
    loading,
    error,
    selectedCustomer,

    // Getters
    sortedCustomers,
    getCustomerById,

    // Actions
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    searchCustomers,
    selectCustomer,
    resetState
  }
})

export type { Customer, NewCustomer }