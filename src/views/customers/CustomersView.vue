<template>
  <div class="customers">
    <!-- Header Section -->
    <section class="page-header" data-aos="fade-down">
      <div class="header-content">
        <h1>Customers</h1>
        <button class="btn btn-primary" @click="showAddCustomer = true">
          <i class="fas fa-plus"></i> Add Customer
        </button>
      </div>
      
      <!-- Search and Filter -->
      <div class="search-filters">
        <div class="search-bar">
          <i class="fas fa-search"></i>
          <input 
            type="text" 
            v-model="searchQuery"
            placeholder="Search customers..."
            @input="handleSearch"
          >
        </div>
        
        <div class="filters">
          <select v-model="filterStatus">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <select v-model="sortBy">
            <option value="name">Name</option>
            <option value="recent">Most Recent</option>
            <option value="jobs">Most Jobs</option>
          </select>
        </div>
      </div>
    </section>

    <!-- Customers Grid -->
    <section class="customers-grid" data-aos="fade-up">
      <div 
        v-for="customer in filteredCustomers" 
        :key="customer.id"
        class="customer-card"
        data-aos="fade-up"
        :data-aos-delay="customer.delay"
      >
        <div class="customer-header">
          <div class="customer-avatar">
            {{ getInitials(customer.name) }}
          </div>
          <div class="customer-info">
            <h3>{{ customer.name }}</h3>
            <p>{{ customer.email }}</p>
          </div>
          <div class="status-badge" :class="customer.status">
            {{ customer.status }}
          </div>
        </div>
        
        <div class="customer-details">
          <div class="detail-item">
            <i class="fas fa-phone"></i>
            <span>{{ customer.phone }}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-map-marker-alt"></i>
            <span>{{ customer.address }}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-tools"></i>
            <span>{{ customer.totalJobs }} Jobs</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-calendar"></i>
            <span>Last Service: {{ customer.lastService }}</span>
          </div>
        </div>
        
        <div class="customer-actions">
          <button class="btn btn-secondary" @click="handleCustomerClick(customer.id)">
            View Details
          </button>
          <button class="btn btn-primary" @click="scheduleJob(customer)">
            Schedule Job
          </button>
          <button class="action-menu" @click="toggleMenu(customer.id)">
            <i class="fas fa-ellipsis-v"></i>
          </button>
          
          <!-- Dropdown Menu -->
          <div 
            v-if="activeMenu === customer.id"
            class="dropdown-menu"
            v-click-outside="closeMenu"
          >
            <button @click="editCustomer(customer)">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button @click="sendReminder(customer)">
              <i class="fas fa-bell"></i> Send Reminder
            </button>
            <button class="delete" @click="confirmDelete(customer)">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Add/Edit Customer Modal -->
    <Modal 
      v-model="showAddCustomer"
      :title="editingCustomer ? 'Edit Customer' : 'Add New Customer'"
    >
      <form @submit.prevent="handleSubmit" class="customer-form">
        <div class="form-group">
          <label for="name">Full Name</label>
          <input 
            type="text" 
            id="name" 
            v-model="formData.name"
            required
          >
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              v-model="formData.email"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="phone">Phone</label>
            <input 
              type="tel" 
              id="phone" 
              v-model="formData.phone"
              required
            >
          </div>
        </div>

        <div class="form-group">
          <label for="address">Address</label>
          <textarea 
            id="address" 
            v-model="formData.address"
            rows="3"
            required
          ></textarea>
        </div>

        <div class="form-group">
          <label for="status">Status</label>
          <select id="status" v-model="formData.status">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="showAddCustomer = false">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary">
            {{ editingCustomer ? 'Update' : 'Add' }} Customer
          </button>
        </div>
      </form>
    </Modal>

    <!-- Delete Confirmation Modal -->
    <Modal
      v-model="showDeleteModal"
      title="Confirm Delete"
    >
      <p>Are you sure you want to delete this customer? This action cannot be undone.</p>
      <template #footer>
        <button class="btn btn-secondary" @click="showDeleteModal = false">Cancel</button>
        <button class="btn btn-danger" @click="deleteCustomer">Delete</button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import Modal from '@/components/Modal.vue';

console.log('CustomersView component loaded');

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
  totalJobs: number;
  lastService: string;
  delay?: number;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
}

const router = useRouter();
const searchQuery = ref('');
const filterStatus = ref('');
const sortBy = ref('name');
const showAddCustomer = ref(false);
const showDeleteModal = ref(false);
const activeMenu = ref<number | null>(null);
const editingCustomer = ref<Customer | null>(null);

const formData = ref<FormData>({
  name: '',
  email: '',
  phone: '',
  address: '',
  status: 'active'
});

// Sample data - replace with API call
const customers = ref<Customer[]>([
  {
    id: 1,
    name: 'John Smith',
    email: 'john@example.com',
    phone: '07700 900000',
    address: '123 Main St, London',
    status: 'active',
    totalJobs: 5,
    lastService: '2023-12-01'
  },
  // Add more sample customers...
]);

const filteredCustomers = computed(() => {
  let result = [...customers.value];

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(customer => 
      customer.name.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      customer.phone.includes(query)
    );
  }

  // Apply status filter
  if (filterStatus.value) {
    result = result.filter(customer => customer.status === filterStatus.value);
  }

  // Apply sorting
  result.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'recent':
        return new Date(b.lastService).getTime() - new Date(a.lastService).getTime();
      case 'jobs':
        return b.totalJobs - a.totalJobs;
      default:
        return 0;
    }
  });

  // Add delay for animation
  return result.map((customer, index) => ({
    ...customer,
    delay: index * 100
  }));
});

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();
}

const handleSearch = () => {
  // Implement debounced search if needed
}

const handleCustomerClick = (customerId: number) => {
  router.push(`/dashboard/customers/${customerId}`);
}

const scheduleJob = (customer: Customer) => {
  router.push(`/schedule-job?customerId=${customer.id}`);
}

const editCustomer = (customer: Customer) => {
  editingCustomer.value = customer;
  formData.value = {
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    status: customer.status
  };
  showAddCustomer.value = true;
  closeMenu();
}

const handleSubmit = async () => {
  try {
    if (editingCustomer.value) {
      // Update existing customer
      const index = customers.value.findIndex(c => c.id === editingCustomer.value?.id);
      if (index !== -1) {
        customers.value[index] = {
          ...customers.value[index],
          ...formData.value
        };
      }
    } else {
      // Add new customer
      customers.value.push({
        id: Date.now(),
        ...formData.value,
        totalJobs: 0,
        lastService: 'Never'
      });
    }
    
    showAddCustomer.value = false;
    resetForm();
  } catch (error) {
    console.error('Error saving customer:', error);
    // Handle error (show notification, etc.)
  }
}

const resetForm = () => {
  formData.value = {
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'active'
  };
  editingCustomer.value = null;
}

const toggleMenu = (customerId: number) => {
  activeMenu.value = activeMenu.value === customerId ? null : customerId;
}

const closeMenu = () => {
  activeMenu.value = null;
}

const confirmDelete = (customer: Customer) => {
  editingCustomer.value = customer;
  showDeleteModal.value = true;
  closeMenu();
}

const deleteCustomer = async () => {
  try {
    if (editingCustomer.value) {
      customers.value = customers.value.filter(c => c.id !== editingCustomer.value?.id);
    }
    showDeleteModal.value = false;
    editingCustomer.value = null;
  } catch (error) {
    console.error('Error deleting customer:', error);
    // Handle error (show notification, etc.)
  }
}

const sendReminder = async (customer: Customer) => {
  try {
    // Implement reminder logic
    console.log('Sending reminder to:', customer.email);
    closeMenu();
  } catch (error) {
    console.error('Error sending reminder:', error);
    // Handle error (show notification, etc.)
  }
}
</script>

<style scoped>
.customers {
  padding: var(--space-4);
}

.page-header {
  margin-bottom: var(--space-6);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.search-filters {
  display: flex;
  gap: var(--space-4);
  align-items: center;
}

.search-bar {
  position: relative;
  flex: 1;
}

.search-bar i {
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
}

.search-bar input {
  width: 100%;
  padding: var(--space-2) var(--space-3) var(--space-2) var(--space-8);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
}

.filters {
  display: flex;
  gap: var(--space-2);
}

.filters select {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  background-color: var(--bg-primary);
}

.customers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-4);
}

.customer-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  box-shadow: var(--shadow-md);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.customer-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.customer-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.customer-avatar {
  width: 48px;
  height: 48px;
  background: var(--primary-blue);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.customer-info {
  flex: 1;
}

.customer-info h3 {
  margin: 0;
  margin-bottom: var(--space-1);
}

.customer-info p {
  color: var(--text-secondary);
  margin: 0;
}

.status-badge {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.active {
  background-color: var(--success);
  color: white;
}

.status-badge.inactive {
  background-color: var(--gray-400);
  color: white;
}

.customer-details {
  margin-bottom: var(--space-4);
}

.detail-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
  color: var(--text-secondary);
}

.customer-actions {
  display: flex;
  gap: var(--space-2);
  position: relative;
}

.action-menu {
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--text-secondary);
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  min-width: 150px;
  z-index: 10;
}

.dropdown-menu button {
  width: 100%;
  text-align: left;
  padding: var(--space-2) var(--space-3);
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--text-primary);
}

.dropdown-menu button:hover {
  background-color: var(--bg-secondary);
}

.dropdown-menu button.delete {
  color: var(--error);
}

.customer-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.form-group label {
  display: block;
  margin-bottom: var(--space-2);
  color: var(--text-secondary);
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: var(--space-2);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-4);
}

@media (max-width: 768px) {
  .search-filters {
    flex-direction: column;
  }

  .filters {
    width: 100%;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .customer-actions {
    flex-wrap: wrap;
  }
}
</style>