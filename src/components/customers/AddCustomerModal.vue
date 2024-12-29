<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Add New Customer</h2>
        <button @click="close" class="close-button">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-form">
        <div class="form-group">
          <label for="firstName">First Name</label>
          <input
            type="text"
            id="firstName"
            v-model="formData.firstName"
            required
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            v-model="formData.lastName"
            required
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="formData.email" required class="form-input" />
        </div>

        <div class="form-group">
          <label for="phone">Phone</label>
          <input type="tel" id="phone" v-model="formData.phone" required class="form-input" />
        </div>

        <div class="form-group">
          <label for="address">Address</label>
          <textarea
            id="address"
            v-model="formData.address"
            required
            class="form-input"
            rows="3"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="notes">Notes</label>
          <textarea id="notes" v-model="formData.notes" class="form-input" rows="3"></textarea>
        </div>

        <div class="modal-actions">
          <button type="button" @click="close" class="cancel-button">Cancel</button>
          <button type="submit" class="submit-button" :disabled="isLoading">
            {{ isLoading ? 'Adding...' : 'Add Customer' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/runtime-core'

interface CustomerFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  notes: string
}

export default defineComponent({
  name: 'AddCustomerModal',
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      formData: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
      } as CustomerFormData,
      isLoading: false,
    }
  },
  methods: {
    close() {
      this.$emit('close')
    },
    async handleSubmit() {
      this.isLoading = true
      try {
        // TODO: Add API call to create customer
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call
        this.$emit('customer-added', this.formData)
        this.close()
      } catch (error) {
        console.error('Error adding customer:', error)
      } finally {
        this.isLoading = false
      }
    },
  },
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

textarea.form-input {
  min-height: 100px;
  resize: vertical;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.submit-button,
.cancel-button {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
}

.submit-button {
  background-color: #42b983;
  color: white;
  border: none;
}

.submit-button:disabled {
  background-color: #a8d5c2;
  cursor: not-allowed;
}

.cancel-button {
  background-color: #f8f9fa;
  border: 1px solid #ddd;
}
</style>
