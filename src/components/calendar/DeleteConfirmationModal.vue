<template>
    <Modal 
      v-model="isOpen"
      :title="title"
    >
      <template #default>
        <div class="delete-confirmation">
          <p class="confirmation-message">
            {{ message }}
          </p>
  
          <div v-if="isRecurringEvent" class="recurring-delete-options">
            <div class="option">
              <input 
                type="radio" 
                id="single"
                value="single"
                v-model="deleteOption"
                name="deleteOption"
              >
              <label for="single">
                <strong>Delete only this occurrence</strong>
                <span class="description">
                  Only this specific appointment will be deleted
                </span>
              </label>
            </div>
  
            <div class="option">
              <input 
                type="radio" 
                id="future"
                value="future"
                v-model="deleteOption"
                name="deleteOption"
              >
              <label for="future">
                <strong>Delete this and future occurrences</strong>
                <span class="description">
                  This and all future appointments in the series will be deleted
                </span>
              </label>
            </div>
  
            <div class="option">
              <input 
                type="radio" 
                id="all"
                value="all"
                v-model="deleteOption"
                name="deleteOption"
              >
              <label for="all">
                <strong>Delete all occurrences</strong>
                <span class="description">
                  The entire series of recurring appointments will be deleted
                </span>
              </label>
            </div>
          </div>
  
          <div v-if="showWarning" class="warning-message">
            <i class="fas fa-exclamation-triangle"></i>
            <span>This action cannot be undone</span>
          </div>
        </div>
      </template>
  
      <template #footer>
        <div class="modal-actions">
          <button 
            class="btn btn-secondary"
            @click="handleCancel"
            :disabled="isDeleting"
          >
            Cancel
          </button>
          <button 
            class="btn btn-danger"
            @click="handleConfirm"
            :disabled="isDeleting"
          >
            <i v-if="isDeleting" class="fas fa-spinner fa-spin"></i>
            {{ isDeleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </template>
    </Modal>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue'
  import Modal from '@/components/Modal.vue'
  import type { CalendarEvent, RecurringEvent } from '@/types/calendar'
  
  const props = defineProps<{
    modelValue: boolean
    event: CalendarEvent | null
    isDeleting?: boolean
  }>()
  
  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'confirm': [option: 'single' | 'future' | 'all']
    'cancel': []
  }>()
  
  // State
  const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })
  
  const deleteOption = ref<'single' | 'future' | 'all'>('single')
  
  // Computed
  const isRecurringEvent = computed(() => {
    return props.event !== null && 'recurrence' in props.event
  })
  
  const title = computed(() => {
    if (!props.event) return 'Delete Appointment'
    return `Delete ${isRecurringEvent.value ? 'Recurring ' : ''}Appointment`
  })
  
  const message = computed(() => {
    if (!props.event) return 'Are you sure you want to delete this appointment?'
    
    if (isRecurringEvent.value) {
      return 'This is a recurring appointment. How would you like to handle the deletion?'
    }
    
    return `Are you sure you want to delete the appointment "${props.event.title}"?`
  })
  
  const showWarning = computed(() => {
    if (!isRecurringEvent.value) return true
    return deleteOption.value === 'all'
  })
  
  // Methods
  function handleConfirm() {
    emit('confirm', deleteOption.value)
  }
  
  function handleCancel() {
    emit('cancel')
    deleteOption.value = 'single' // Reset to default
  }
  </script>
  
  <style scoped>
/* Delete Confirmation Container */
.delete-confirmation {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* Confirmation Message */
.confirmation-message {
  font-size: var(--font-size-base);
  color: var(--text-1);
  margin-bottom: var(--space-4);
}

/* Recurring Delete Options */
.recurring-delete-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--surface-2);
  border-radius: var(--radius-md);
}

.option {
  display: flex;
  gap: var(--space-3);
  align-items: flex-start;
  padding: var(--space-2);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.option:hover {
  background: var(--surface-3);
  border-radius: var(--radius-sm);
}

.option input[type="radio"] {
  margin-top: var(--space-1);
}

.option label {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  cursor: pointer;
}

.option .description {
  font-size: var(--font-size-sm);
  color: var(--text-2);
}

/* Warning Message */
.warning-message {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--error);
  font-size: var(--font-size-sm);
  padding: var(--space-3);
  background: var(--error-50);
  border-radius: var(--radius-md);
}

.warning-message i {
  color: var(--error);
}

/* Modal Actions */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-4);
}

/* Loading State */
.btn-danger.is-loading {
  position: relative;
  color: transparent;
}

.btn-danger.is-loading::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 16px;
  height: 16px;
  margin-left: -8px;
  margin-top: -8px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive Styles */
@media (max-width: 768px) {
  .option {
    padding: var(--space-3);
  }

  .option label {
    gap: var(--space-2);
  }

  .modal-actions {
    flex-direction: column-reverse;
    gap: var(--space-2);
  }

  .modal-actions button {
    width: 100%;
  }

  .warning-message {
    flex-direction: column;
    text-align: center;
    padding: var(--space-4);
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .recurring-delete-options {
    background: var(--surface-3);
  }

  .option:hover {
    background: var(--surface-4);
  }

  .warning-message {
    background: var(--error-900);
    color: var(--error-50);
  }

  .warning-message i {
    color: var(--error-50);
  }

  .option input[type="radio"] {
    accent-color: var(--primary-blue);
  }
}

/* Animation */
.delete-confirmation {
  animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>