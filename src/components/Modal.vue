<template>
    <Transition name="modal-fade">
      <div v-if="modelValue" class="modal-overlay" @click="closeOnOverlay">
        <div class="modal-wrapper" @click.stop>
          <div class="modal-header">
            <slot name="header">
              <h3>{{ title }}</h3>
            </slot>
            <button class="modal-close" @click="close">×</button>
          </div>
          
          <div class="modal-body">
            <slot></slot>
          </div>
          
          <div class="modal-footer">
            <slot name="footer">
              <button class="btn btn-secondary" @click="close">Close</button>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
  </template>
  
  <script setup lang="ts">
  defineProps({
    modelValue: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      default: ''
    },
    closeOnOutsideClick: {
      type: Boolean,
      default: true
    }
  })
  
  const emit = defineEmits(['update:modelValue'])
  
  const close = () => {
    emit('update:modelValue', false)
  }
  
  const closeOnOverlay = (event: MouseEvent) => {
    if (event.target === event.currentTarget) {
      close()
    }
  }
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
    z-index: 100;
  }
  
  .modal-wrapper {
    background: var(--bg-primary);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
  }
  
  .modal-header {
    padding: var(--space-4);
    border-bottom: 1px solid var(--border-light);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .modal-header h3 {
    margin: 0;
    font-size: 1.25rem;
  }
  
  .modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--text-secondary);
    padding: var(--space-2);
    line-height: 1;
    transition: color 0.3s ease;
  }
  
  .modal-close:hover {
    color: var(--text-primary);
  }
  
  .modal-body {
    padding: var(--space-4);
    overflow-y: auto;
  }
  
  .modal-footer {
    padding: var(--space-4);
    border-top: 1px solid var(--border-light);
    display: flex;
    justify-content: flex-end;
    gap: var(--space-2);
  }
  
  /* Transition animations */
  .modal-fade-enter-active,
  .modal-fade-leave-active {
    transition: opacity 0.3s ease;
  }
  
  .modal-fade-enter-from,
  .modal-fade-leave-to {
    opacity: 0;
  }
  
  .modal-fade-enter-from .modal-wrapper,
  .modal-fade-leave-to .modal-wrapper {
    transform: translateY(20px);
  }
  </style>