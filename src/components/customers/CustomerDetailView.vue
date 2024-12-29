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
      <modal v-if="showEditModal" @close="showEditModal = false">
        <template #header>
          <h2>Edit Customer Details</h2>
        </template>
        
        <template #body>
          <form @submit.prevent="handleEdit" class="edit-form">
            <!-- Form fields -->
          </form>
        </template>
      </modal>
  
      <!-- Add Note Modal -->
      <modal v-if="showAddNote" @close="showAddNote = false">
        <template #header>
          <h2>Add Note</h2>
        </template>
        
        <template #body>
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
      </modal>
  
      <!-- Delete Confirmation Modal -->
      <modal v-if="showDeleteModal" @close="showDeleteModal = false">
        <template #header>
          <h2>Confirm Delete</h2>
        </template>
        
        <template #body>
          <p>Are you sure you want to delete this customer? This action cannot be undone.</p>
        </template>
      </modal>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import Modal from '@/components/Modal.vue'
  
  const router = useRouter()
  const route = useRoute()
  const activeTab = ref('overview')
  const showActions = ref(false)
  const showEditModal = ref(false)
  const showAddNote = ref(false)
  const showDeleteModal = ref(false)
  const newNote = ref('')
  
  // Sample data - replace with API calls
  const customer = ref({
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
  
  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'fas fa-user' },
    { id: 'jobs', label: 'Job History', icon: 'fas fa-tools' },
    { id: 'documents', label: 'Documents', icon: 'fas fa-file' }
  ]
  
  const jobHistory = ref([
    {
      id: 1,
      type: 'Annual Service',
      date: '2024-01-15',
      description: 'Regular boiler service',
      cost: 120,
      status: 'completed'
    },
    // Add more jobs...
  ])
  
  const documents = ref([
    {
      id: 1,
      name: 'Service Report - Jan 2024',
      date: '2024-01-15',
      type: 'pdf'
    },
    // Add more documents...
  ])
  
  // Utility functions
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
  }
  
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB')
  }
  
  const getDocumentIcon = (type: string) => {
    const icons = {
      pdf: 'fas fa-file-pdf',
      doc: 'fas fa-file-word',
      image: 'fas fa-file-image'
    }
    return icons[type] || 'fas fa-file'
  }
  
  // Event handlers
  const closeActions = () => {
    showActions.value = false
  }
  
  const scheduleJob = () => {
    router.push(`/schedule-job?customer=${customer.value.id}`)
  }
  
  const handleEdit = async () => {
    // Implement edit logic
    showEditModal.value = false
  }
  
  const handleAddNote = async () => {
    // Implement add note logic
    showAddNote.value = false
  }
  
  const confirmDelete = () => {
    showDeleteModal.value = true
  }
  
  const viewJobDetails = (job: any) => {
    router.push(`/jobs/${job.id}`)
  }
  
  const downloadDocument = (doc: any) => {
    // Implement download logic
  }
  
  const viewDocument = (doc: any) => {
    // Implement view logic
  }
  
  onMounted(async () => {
    // Fetch customer data
    const id = route.params.id
    // Implement API call
  })
  </script>
  
  <style scoped>
  .customer-detail {
    padding: var(--space-4);
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .back-button {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border: none;
    background: none;
    color: var(--text-secondary);
    cursor: pointer;
    margin-bottom: var(--space-4);
    transition: color 0.3s ease;
  }
  
  .back-button:hover {
    color: var(--primary-blue);
  }
  
  .customer-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--space-6);
    padding: var(--space-4);
    background: var(--bg-primary);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
  }
  
  .customer-info {
    display: flex;
    gap: var(--space-4);
    align-items: center;
  }
  
  .customer-avatar {
    width: 64px;
    height: 64px;
    background: var(--primary-blue);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 600;
  }
  
  .customer-main-info h1 {
    margin: 0;
    margin-bottom: var(--space-2);
  }
  
  .customer-meta {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }
  
  .customer-since {
    color: var(--text-secondary);
    font-size: 0.875rem;
  }
  
  .header-actions {
    display: flex;
    gap: var(--space-2);
    position: relative;
  }
  
  /* Tabs Styling */
  .customer-tabs {
    background: var(--bg-primary);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    overflow: hidden;
  }
  
  .tabs-header {
    display: flex;
    border-bottom: 2px solid var(--border-light);
    background: var(--bg-secondary);
  }
  
  .tab-button {
    padding: var(--space-3) var(--space-4);
    border: none;
    background: none;
    cursor: pointer;
    color: var(--text-secondary);
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: var(--space-2);
    transition: all 0.3s ease;
  }
  
  .tab-button.active {
    color: var(--primary-blue);
    border-bottom: 2px solid var(--primary-blue);
    margin-bottom: -2px;
  }
  
  .tab-content {
    padding: var(--space-4);
  }
  
  /* Overview Tab Styling */
  .overview-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--space-4);
  }
  
  .info-card {
    background: var(--bg-secondary);
    padding: var(--space-4);
    border-radius: var(--radius-md);
  }
  
  .info-card h3 {
    margin-bottom: var(--space-4);
    color: var(--text-primary);
  }
  
  .info-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }
  
  .info-item {
    display: flex;
    gap: var(--space-3);
    align-items: flex-start;
  }
  
  .info-item i {
    color: var(--text-secondary);
    margin-top: var(--space-1);
  }
  
  .info-item label {
    color: var(--text-secondary);
    font-size: 0.875rem;
    margin-bottom: var(--space-1);
    display: block;
  }
  
  /* Jobs Timeline Styling */
  .jobs-timeline {
    position: relative;
    padding-left: var(--space-4);
  }
  
  .job-item {
    position: relative;
    padding-bottom: var(--space-4);
    padding-left: var(--space-4);
    border-left: 2px solid var(--border-light);
  }
  
  .job-marker {
    position: absolute;
    left: -9px;
    top: 0;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--primary-blue);
    border: 3px solid var(--bg-primary);
  }
  
  .job-content {
    background: var(--bg-secondary);
    padding: var(--space-3);
    border-radius: var(--radius-md);
  }
  
  /* Documents Grid Styling */
  .documents-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: var(--space-4);
  }
  
  .document-card {
    background: var(--bg-secondary);
    padding: var(--space-3);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }
  
  .doc-icon {
    width: 40px;
    height: 40px;
    background: var(--primary-blue);
    color: white;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .doc-info {
    flex: 1;
  }
  
  .doc-info h4 {
    margin: 0;
    margin-bottom: var(--space-1);
  }
  
  .doc-info p {
    color: var(--text-secondary);
    font-size: 0.875rem;
    margin: 0;
  }
  
  @media (max-width: 768px) {
    .customer-header {
      flex-direction: column;
      gap: var(--space-4);
    }
  
    .header-actions {
      width: 100%;
    }
  
    .tabs-header {
      overflow-x: auto;
      white-space: nowrap;
    }
  
    .overview-grid {
      grid-template-columns: 1fr;
    }
  }
  </style>