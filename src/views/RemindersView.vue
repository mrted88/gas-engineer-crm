<template>
    <div class="reminders-container">
      <h1>Reminders</h1>
      <div class="tabs">
        <button 
          class="tab-button"
          :class="{ active: activeTab === 'service' }"
          @click="activeTab = 'service'"
        >
          Service Due
        </button>
        <button 
          class="tab-button"
          :class="{ active: activeTab === 'gas-safety' }"
          @click="activeTab = 'gas-safety'"
        >
          Gas Safety Checks
        </button>
      </div>
      <div class="placeholder-content">
        <p>{{ activeTab === 'service' ? 'Service reminders' : 'Gas safety check reminders' }} coming soon...</p>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  
  const activeTab = ref('service')
  </script>
  
  <style scoped>
  .reminders-container {
    padding: var(--space-4);
  }
  
  .tabs {
    margin: var(--space-4) 0;
    display: flex;
    gap: var(--space-2);
  }
  
  .tab-button {
    padding: var(--space-2) var(--space-4);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background: var(--surface-1);
    cursor: pointer;
  }
  
  .tab-button.active {
    background: var(--primary-blue);
    color: white;
    border-color: var(--primary-blue);
  }
  
  .placeholder-content {
    padding: var(--space-4);
    background: var(--surface-1);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);
  }
  </style>