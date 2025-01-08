<template>
  <div v-if="error" class="error-boundary">
    <div class="error-content">
      <i class="fas fa-exclamation-circle error-icon"></i>
      <h2>{{ error.name || 'Error' }}</h2>
      <p>{{ error.message || 'An unexpected error occurred.' }}</p>
      <div class="error-actions">
        <button class="btn btn-secondary" @click="retry">
          <i class="fas fa-redo"></i> Try Again
        </button>
        <button class="btn btn-primary" @click="reset">
          <i class="fas fa-home"></i> Return Home
        </button>
      </div>
      <details v-if="error.stack && isDevelopment" class="error-details">
        <summary>Technical Details</summary>
        <pre>{{ error.stack }}</pre>
      </details>
    </div>
  </div>
  <slot v-else></slot>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  onError?: (error: Error) => void
}>()

const router = useRouter()
const error = ref<Error | null>(null)
const isDevelopment = import.meta.env.DEV

const retry = () => {
  if (error.value && props.onError) {
    props.onError(error.value)
  }
  error.value = null
}

const reset = () => {
  error.value = null
  router.push('/')
}

onErrorCaptured((err: Error) => {
  error.value = err
  return false
})
</script>
  
  <style scoped>
  .error-boundary {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-4);
    background: var(--bg-secondary);
  }
  
  .error-content {
    max-width: 500px;
    text-align: center;
    padding: var(--space-6);
    background: var(--bg-primary);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
  }
  
  .error-icon {
    font-size: 3rem;
    color: var(--error);
    margin-bottom: var(--space-4);
  }
  
  .error-actions {
    display: flex;
    gap: var(--space-3);
    justify-content: center;
    margin-top: var(--space-4);
  }
  
  .error-details {
    margin-top: var(--space-4);
    text-align: left;
  }
  
  .error-details summary {
    cursor: pointer;
    color: var(--text-secondary);
  }
  
  .error-details pre {
    margin-top: var(--space-2);
    padding: var(--space-3);
    background: var(--gray-100);
    border-radius: var(--radius-md);
    overflow-x: auto;
    font-size: 0.875rem;
  }
  </style>