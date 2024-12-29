<template>
    <div class="loading-spinner">
      <div class="spinner"></div>
      <p v-if="message">{{ message }}</p>
    </div>
  </template>
  
  <script setup lang="ts">
  defineProps({
    message: {
      type: String,
      default: 'Loading...'
    }
  })
  </script>
  
  <style scoped>
  .loading-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
  }
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--border-light);
    border-top-color: var(--primary-blue);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  p {
    margin-top: var(--space-3);
    color: var(--text-secondary);
  }
  </style>