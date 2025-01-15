<template>
  <div class="customer-profile-container">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      Loading...
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadCustomerData" class="btn btn-primary">Retry</button>
      <button @click="router.push('/dashboard/customers')" class="btn btn-secondary">Back to Customers</button>
    </div>

    <div v-else-if="customer" class="customer-profile">
      <div class="profile-header">
        <h1>{{ customer.name }}</h1>
        <div class="contact-info">
          <p><strong>Phone:</strong> {{ customer.phone }}</p>
          <p><strong>Email:</strong> {{ customer.email }}</p>
          <p><strong>Address:</strong> {{ customer.address }}</p>
        </div>
      </div>

      <!-- Tabs Component -->
      <Tabs :tabs="tabs" />

      <!-- Details Form (moved to a separate tab component) -->
      <!--
      <div class="profile-details">
        <h2>Details</h2>
        <form @submit.prevent="saveCustomerDetails">
          <div class="form-group">
            <label for="name">Name</label>
            <input v-model="customer.name" id="name" type="text" />
          </div>
          <div class="form-group">
            <label for="phone">Phone</label>
            <input v-model="customer.phone" id="phone" type="text" />
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input v-model="customer.email" id="email" type="email" />
          </div>
          <div class="form-group">
            <label for="address">Address</label>
            <textarea v-model="customer.address" id="address"></textarea>
          </div>
          <button type="submit" class="btn btn-success">Save</button>
        </form>
      </div>
      -->
    </div>

    <div v-else class="not-found">
      <p>Customer not found</p>
      <button @click="router.push('/dashboard/customers')" class="btn btn-primary">Back to Customers</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCustomersStore } from '@/stores/customers';
import type { Customer } from '@/types/customer';
import Tabs from '@/components/Tabs.vue';

const route = useRoute();
const router = useRouter();
const customersStore = useCustomersStore();

const customer = ref<Customer | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const tabs = [
  { name: 'Details', component: 'CustomerDetails' },
  { name: 'Job History', component: 'CustomerJobHistory' },
  { name: 'Quotes', component: 'CustomerQuotes' },
  { name: 'Appointments', component: 'CustomerAppointments' },
  { name: 'Forms & Certificates', component: 'CustomerForms' },
  { name: 'Invoices', component: 'CustomerInvoices' }
];

async function loadCustomerData() {
  const customerId = route.params.id as string;
  if (!customerId) {
    router.push('/dashboard/customers');
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const customerData = await customersStore.getCustomer(customerId);
    if (!customerData) {
      throw new Error('Customer not found');
    }

    customer.value = customerData;
  } catch (err) {
    console.error('Error loading customer:', err);
    error.value = err instanceof Error ? err.message : 'Failed to load customer';
  } finally {
    loading.value = false;
  }
}

async function saveCustomerDetails() {
  if (!customer.value) return;

  try {
    loading.value = true;
    await customersStore.updateCustomer(customer.value.id, customer.value);
    alert('Customer details updated successfully');
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to update customer';
  } finally {
    loading.value = false;
  }
}

onMounted(loadCustomerData);
</script>

<style scoped>
.customer-profile-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.loading-state,
.error-state,
.not-found {
  text-align: center;
  padding: 2rem;
}

.customer-profile {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.profile-header {
  margin-bottom: 2rem;
}

.contact-info p {
  margin: 0.5rem 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>