<template>
  <div class="customer-detail">
    <!-- Back Navigation -->
    <button class="back-button" @click="router.back()" data-aos="fade-right">
      <i class="fas fa-arrow-left"></i>
      Back to Customers
    </button>

    <!-- Customer Header -->
    <section class="customer-header" data-aos="fade-down">
      <div class="customer-info">
        <div class="customer-avatar">
          {{ getInitials(customer.name) }}
        </div>
        <div class="customer-main-info">
          <h1>{{ customer.name }}</h1>
          <div class="customer-meta">
            <span class="status-badge" :class="customer.status">
              {{ customer.status }}
            </span>
            <span class="customer-since">
              Customer since {{ formatDate(customer.createdAt) }}
            </span>
          </div>
        </div>
      </div>
      
      <div class="header-actions">
        <button class="btn btn-primary" @click="scheduleJob">
          <i class="fas fa-calendar-plus"></i>
          Schedule Job
        </button>
        <button class="btn btn-secondary" @click="showEditModal = true">
          <i class="fas fa-edit"></i>
          Edit Details
        </button>
        <button class="action-menu" @click="showActions = !showActions">
          <i class="fas fa-ellipsis-v"></i>
        </button>
        
        <!-- Actions Dropdown -->
        <div v-if="showActions" class="actions-dropdown" v-click-outside="closeActions">
          <button @click="sendReminder">
            <i class="fas fa-bell"></i>
            Send Reminder
          </button>
          <button @click="exportData">
            <i class="fas fa-file-export"></i>
            Export Data
          </button>
          <button class="delete" @click="confirmDelete">
            <i class="fas fa-trash"></i>
            Delete Customer
          </button>
        </div>
      </div>
    </section>

    <!-- Customer Details Tabs -->
    <section class="customer-tabs" data-aos="fade-up">
      <div class="tabs-header">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['tab-button', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          <i :class="tab.icon"></i>
          {{ tab.label }}
        </button>
      </div>

      <!-- Overview Tab -->
      <div v-if="activeTab === 'overview'" class="tab-content">
        <div class="overview-grid">
          <div class="info-card contact-info">
            <h3>Contact Information</h3>
            <div class="info-list">
              <div class="info-item">
                <i class="fas fa-envelope"></i>
                <div>
                  <label>Email</label>
                  <p>{{ customer.email }}</p>
                </div>
              </div>
              <div class="info-item">
                <i class="fas fa-phone"></i>
                <div>
                  <label>Phone</label>
                  <p>{{ customer.phone }}</p>
                </div>
              </div>
              <div class="info-item">
                <i class="fas fa-map-marker-alt"></i>
                <div>
                  <label>Address</label>
                  <p>{{ customer.address }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="info-card stats">
            <h3>Statistics</h3>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-value">{{ customer.totalJobs }}</span>
                <span class="stat-label">Total Jobs</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">£{{ customer.totalSpent }}</span>
                <span class="stat-label">Total Spent</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ customer.lastService }}</span>
                <span class="stat-label">Last Service</span>
              </div>
            </div>
          </div>

          <div class="info-card notes">
            <h3>Notes</h3>
            <div class="notes-content">
              <p v-if="customer.notes">{{ customer.notes }}</p>
              <p v-else class="no-notes">No notes added yet</p>
              <button class="btn btn-secondary" @click="showAddNote = true">
                Add Note
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Jobs History Tab -->
      <div v-if="activeTab === 'jobs'" class="tab-content">
        <div class="jobs-timeline">
          <div 
            v-for="job in jobHistory" 
            :key="job.id"
            class="job-item"
            :class="job.status"
          >
            <div class="job-marker"></div>
            <div class="job-content">
              <div class="job-header">
                <h4>{{ job.type }}</h4>
                <span class="job-date">{{ formatDate(job.date) }}</span>
              </div>
              <p>{{ job.description }}</p>
              <div class="job-meta">
                <span class="job-cost">£{{ job.cost }}</span>
                <span class="job-status">{{ job.status }}</span>
              </div>
              <button class="btn btn-secondary" @click="viewJobDetails(job)">
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Documents Tab -->
      <div v-if="activeTab === 'documents'" class="tab-content">
        <div class="documents-grid">
          <div 
            v-for="doc in documents" 
            :key="doc.id"
            class="document-card"
          >
            <div class="doc-icon">
              <i :class="getDocumentIcon(doc.type)"></i>
            </div>
            <div class="doc-info">
              <h4>{{ doc.name }}</h4>
              <p>{{ formatDate(doc.date) }}</p>
            </div>
            <div class="doc-actions">
              <button class="btn btn-secondary" @click="downloadDocument(doc)">
                <i class="fas fa-download"></i>
              </button>
              <button class="btn btn-secondary" @click="viewDocument(doc)">
                <i class="fas fa-eye"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Edit Customer Modal -->
    <Modal 
      v-model="showEditModal"
      title="Edit Customer Details"
    >
      <template #default>
        <form @submit.prevent="handleEdit" class="edit-form">
          <!-- Form fields -->
        </form>
      </template>
    </Modal>

    <!-- Add Note Modal -->
    <Modal 
      v-model="showAddNote"
      title="Add Note"
    >
      <template #default>
        <form @submit.prevent="handleAddNote" class="note-form">
          <div class="form-group">
            <label for="note">Note</label>
            <textarea 
              id="note" 
              v-model="newNote"
              rows="4"
              required
            ></textarea>
          </div>
        </form>
      </template>
    </Modal>

    <!-- Delete Confirmation Modal -->
    <Modal 
      v-model="showDeleteModal"
      title="Confirm Delete"
    >
      <template #default>
        <p>Are you sure you want to delete this customer? This action cannot be undone.</p>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Modal from '@/components/Modal.vue'
import { vClickOutside } from '@/directives/clickOutside'

// Interfaces
interface Customer {
  id: number
  name: string
  email: string
  phone: string
  address: string
  status: string
  createdAt: string
  totalJobs: number
  totalSpent: number
  lastService: string
  notes: string
}

interface Job {
  id: number
  type: string
  date: string
  description: string
  cost: number
  status: string
}

interface Document {
  id: number
  name: string
  date: string
  type: 'pdf' | 'doc' | 'image'
}

interface Tab {
  id: string
  label: string
  icon: string
}

// Router setup
const router = useRouter()
const route = useRoute()

// State
const activeTab = ref('overview')
const showActions = ref(false)
const showEditModal = ref(false)
const showAddNote = ref(false)
const showDeleteModal = ref(false)
const newNote = ref('')

// Data
const customer = ref<Customer>({
  id: 1,
  name: 'John Smith',
  email: 'john@example.com',
  phone: '07700 900000',
  address: '123 Main St, London',
  status: 'active',
  createdAt: '2023-01-15',
  totalJobs: 5,
  totalSpent: 1250,
  lastService: '2024-01-15',
  notes: 'Regular maintenance customer. Prefers morning appointments.'
})

const tabs: Tab[] = [
  { id: 'overview', label: 'Overview', icon: 'fas fa-user' },
  { id: 'jobs', label: 'Job History', icon: 'fas fa-tools' },
  { id: 'documents', label: 'Documents', icon: 'fas fa-file' }
]

const jobHistory = ref<Job[]>([
  {
    id: 1,
    type: 'Annual Service',
    date: '2024-01-15',
    description: 'Regular boiler service',
    cost: 120,
    status: 'completed'
  }
])

const documents = ref<Document[]>([
  {
    id: 1,
    name: 'Service Report - Jan 2024',
    date: '2024-01-15',
    type: 'pdf'
  }
])

// Methods
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
}

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-GB')
}

const getDocumentIcon = (type: 'pdf' | 'doc' | 'image'): string => {
  const icons = {
    pdf: 'fas fa-file-pdf',
    doc: 'fas fa-file-word',
    image: 'fas fa-file-image'
  } as const
  return icons[type] || 'fas fa-file'
}

const closeActions = (): void => {
  showActions.value = false
}

const scheduleJob = (): void => {
  router.push(`/schedule-job?customer=${customer.value.id}`)
}

const sendReminder = async (): Promise<void> => {
  try {
    // Implement reminder logic here
    showActions.value = false
  } catch (error) {
    console.error('Failed to send reminder:', error)
  }
}

const exportData = async (): Promise<void> => {
  try {
    // Implement export logic here
    showActions.value = false
  } catch (error) {
    console.error('Failed to export data:', error)
  }
}

const handleEdit = async (): Promise<void> => {
  // Implement edit logic
  showEditModal.value = false
}

const handleAddNote = async (): Promise<void> => {
  // Implement add note logic
  showAddNote.value = false
}

const confirmDelete = (): void => {
  showDeleteModal.value = true
}

const viewJobDetails = (job: Job): void => {
  router.push(`/jobs/${job.id}`)
}

const downloadDocument = (doc: Document): void => {
  // Implement download logic
}

const viewDocument = (doc: Document): void => {
  // Implement view logic
}

onMounted(async () => {
  // Fetch customer data
  const id = route.params.id
  // Implement API call
})
</script>

<style scoped>
/* Existing styles */
.customer-detail {
  padding: var(--space-4);
  max-width: 1200px;
  margin: 0 auto;
}

/* ... (previous styles remain the same) ... */

/* New styles for status badge */
.status-badge {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: 500;
  text-transform: capitalize;
}

.status-badge.active {
  background-color: var(--success-100);
  color: var(--success-700);
}

.status-badge.inactive {
  background-color: var(--error-100);
  color: var(--error-700);
}

/* Actions Dropdown */
.actions-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--surface-1);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  min-width: 200px;
  z-index: 10;
}

.actions-dropdown button {
  width: 100%;
  text-align: left;
  padding: var(--space-2) var(--space-3);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  border: none;
  background: none;
  color: var(--text-1);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.actions-dropdown button:hover {
  background-color: var(--surface-2);
}

.actions-dropdown button.delete {
  color: var(--error-600);
}

.actions-dropdown button.delete:hover {
  background-color: var(--error-50);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--primary-600);
  display: block;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-2);
  margin-top: var(--space-1);
  display: block;
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .actions-dropdown {
    background: var(--surface-2);
  }

  .actions-dropdown button:hover {
    background-color: var(--surface-3);
  }

  .stat-value {
    color: var(--primary-400);
  }
}
</style>