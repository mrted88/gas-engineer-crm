<!-- src/components/Tabs.vue -->
<template>
    <div class="tabs">
      <ul class="tab-list">
        <li
          v-for="(tab, index) in tabs"
          :key="index"
          :class="{ active: activeTab === index }"
          @click="activeTab = index"
        >
          {{ tab.name }}
        </li>
      </ul>
      <div class="tab-content">
        <component :is="currentComponent" />
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue';
  
  // Define and access props
  const props = defineProps<{ tabs: { name: string; component: string }[] }>();
  
  const activeTab = ref(0);
  
  const currentComponent = computed(() => {
    return props.tabs[activeTab.value].component;
  });
  </script>
  
  <style scoped>
  .tabs {
    border-bottom: 1px solid #ccc;
  }
  .tab-list {
    display: flex;
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .tab-list li {
    padding: 10px 20px;
    cursor: pointer;
    border-bottom: 2px solid transparent;
  }
  .tab-list li.active {
    border-bottom-color: #007bff;
  }
  .tab-content {
    padding: 20px;
  }
  </style>