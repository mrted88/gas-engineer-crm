<template>
    <div class="notifications">
      <TransitionGroup name="notification">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification"
          :class="notification.type"
        >
          <div class="notification-icon">
            <i :class="getIcon(notification.type)"></i>
          </div>
          <div class="notification-content">
            <h4>{{ notification.title }}</h4>
            <p>{{ notification.message }}</p>
          </div>
          <button 
            class="notification-close"
            @click="removeNotification(notification.id)"
          >
            ×
          </button>
          <div 
            class="notification-progress"
            :style="{ animationDuration: `${notification.duration}ms` }"
          ></div>
        </div>
      </TransitionGroup>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  
  interface Notification {
    id: number
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
    duration: number
  }
  
  const notifications = ref<Notification[]>([])
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return 'fas fa-check-circle'
      case 'error': return 'fas fa-exclamation-circle'
      case 'warning': return 'fas fa-exclamation-triangle'
      case 'info': return 'fas fa-info-circle'
      default: return 'fas fa-bell'
    }
  }
  
  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now()
    notifications.value.push({ ...notification, id })
    setTimeout(() => {
      removeNotification(id)
    }, notification.duration)
  }
  
  const removeNotification = (id: number) => {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }
  
  // Expose methods to parent components
  defineExpose({
    addNotification,
    removeNotification
  })
  </script>
  
  <style scoped>
  .notifications {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 400px;
  }
  
  .notification {
    position: relative;
    display: flex;
    align-items: start;
    padding: 16px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }
  
  .notification-icon {
    flex-shrink: 0;
    font-size: 20px;
    margin-right: 12px;
  }
  
  .notification-content {
    flex-grow: 1;
  }
  
  .notification-content h4 {
    margin: 0;
    font-size: 16px;
  }
  
  .notification-content p {
    margin: 4px 0 0;
    font-size: 14px;
    color: var(--text-secondary);
  }
  
  .notification-close {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    padding: 4px;
    color: var(--text-secondary);
  }
  
  .notification-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    background: currentColor;
    animation: progress linear forwards;
  }
  
  .notification.success {
    border-left: 4px solid var(--success);
    color: var(--success);
  }
  
  .notification.error {
    border-left: 4px solid var(--error);
    color: var(--error);
  }
  
  .notification.warning {
    border-left: 4px solid var(--warning);
    color: var(--warning);
  }
  
  .notification.info {
    border-left: 4px solid var(--primary-blue);
    color: var(--primary-blue);
  }
  
  @keyframes progress {
    from { width: 100%; }
    to { width: 0%; }
  }
  
  .notification-enter-active,
  .notification-leave-active {
    transition: all 0.3s ease;
  }
  
  .notification-enter-from,
  .notification-leave-to {
    opacity: 0;
    transform: translateX(30px);
  }
  </style>