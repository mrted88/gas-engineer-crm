<template>
  <div class="dashboard-container">
    <aside class="sidebar" :class="{ 
      'sidebar-collapsed': isSidebarCollapsed,
      'sidebar-mobile-open': !isSidebarCollapsed 
    }">
      <div class="sidebar-header">
        <img src="@/assets/logo.svg" alt="Logo" class="logo" />
        <button class="collapse-btn" @click="toggleSidebar">
          <i :class="isSidebarCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left'"></i>
        </button>
      </div>

      <nav class="sidebar-nav">
        <!-- Regular nav items -->
        <RouterLink
          v-for="item in navigationItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: currentRoute.path.startsWith(item.path) }"
        >
          <i :class="`fas ${item.icon}`"></i>
          <span v-if="!isSidebarCollapsed">{{ item.name }}</span>
        </RouterLink>

        <!-- Reminders dropdown -->
        <div 
          class="nav-item dropdown"
          :class="{ 
            active: isRemindersActive,
            'dropdown-open': isRemindersOpen 
          }"
          @click="toggleReminders"
        >
          <div class="nav-item-content">
            <i class="fas fa-bell"></i>
            <span v-if="!isSidebarCollapsed">Reminders</span>
            <i 
              v-if="!isSidebarCollapsed" 
              class="fas fa-chevron-down dropdown-icon"
              :class="{ 'rotated': isRemindersOpen }"
            ></i>
          </div>
          
          <div class="dropdown-content" v-if="!isSidebarCollapsed">
            <RouterLink
              v-for="child in remindersItems"
              :key="child.path"
              :to="child.path"
              class="dropdown-item"
              :class="{ active: currentRoute.path === child.path }"
            >
              <i :class="`fas ${child.icon}`"></i>
              {{ child.name }}
            </RouterLink>
          </div>
        </div>
      </nav>
    </aside>

    <main class="main-content">
      <header class="content-header">
        <button 
          class="mobile-menu-btn"
          @click="toggleSidebar"
        >
          <i class="fas fa-bars"></i>
        </button>

        <img src="@/assets/logo.svg" alt="Logo" class="header-logo" />

        <div class="user-dropdown" @click="toggleUserMenu" ref="userMenuRef">
          <button class="user-dropdown-button">
            <i class="fas fa-user-circle"></i>
            <span>{{ currentUser?.name }}</span>
            <i class="fas fa-chevron-down"></i>
          </button>
          
          <div class="user-dropdown-menu" v-if="isUserMenuOpen">
            <div class="user-info">
              <strong>{{ currentUser?.name }}</strong>
              <span>{{ currentUser?.email }}</span>
            </div>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item" @click="logout">
              <i class="fas fa-sign-out-alt"></i>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div class="content-body">
        <Suspense>
          <template #default>
            <RouterView />
          </template>
          <template #fallback>
            <div class="loading-state">
              <div class="spinner"></div>
              <p>Loading...</p>
            </div>
          </template>
        </Suspense>
      </div>
    </main>

    <!-- Overlay for mobile -->
    <div 
      v-if="!isSidebarCollapsed" 
      class="sidebar-overlay"
      @click="toggleSidebar"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter, RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const isSidebarCollapsed = ref(true)
const isRemindersOpen = ref(false)

// User dropdown state
const isUserMenuOpen = ref(false)
const userMenuRef = ref<HTMLElement | null>(null)

const currentUser = computed(() => authStore.user)
const currentRoute = computed(() => route)

const isRemindersActive = computed(() => 
  route.path.startsWith('/reminders')
)

function toggleUserMenu() {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

function handleClickOutside(event: MouseEvent) {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    isUserMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const remindersItems = [
  { 
    name: 'Services', 
    path: '/reminders/services',
    icon: 'fa-wrench'
  },
  { 
    name: 'LGSC', 
    path: '/reminders/lgsc',
    icon: 'fa-fire'
  }
]

const navigationItems = [
  {
    name: 'Diary',
    icon: 'fa-calendar-alt',
    path: '/diary'
  },
  {
    name: 'Customers',
    icon: 'fa-user-friends',
    path: '/customers'
  },
  {
    name: 'Quotes',
    icon: 'fa-file-signature',
    path: '/quotes'
  },
  {
    name: 'Jobs',
    icon: 'fa-hard-hat',
    path: '/jobs'
  },
  {
    name: 'Inventory',
    icon: 'fa-boxes',
    path: '/inventory'
  },
  {
    name: 'Reports',
    icon: 'fa-clipboard-list',
    path: '/reports'
  },
  {
    name: 'Accounts',
    icon: 'fa-piggy-bank',
    path: '/accounts'
  },
  {
    name: 'Settings',
    icon: 'fa-cog',
    path: '/settings'
  }
]

function toggleSidebar() {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

function toggleReminders() {
  if (!isSidebarCollapsed.value) {
    isRemindersOpen.value = !isRemindersOpen.value
  }
}

async function logout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.dashboard-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background-color: var(--main-bg);
}

/* Mobile menu button */
.mobile-menu-btn {
  display: none;
  background: #2c4b7c;
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: 0.75rem;
  cursor: pointer;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.mobile-menu-btn:hover {
  background: #3a5d8f;
}

/* Loading state */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color);
  border-top-color: var(--primary-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Overlay */
.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 40;
}

/* Sidebar styles */
.sidebar {
  width: 250px;
  background: #2c4b7c;
  color: #ffffff;
  border-right: 1px solid var(--border-color);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-md);
}

.sidebar-collapsed {
  width: 70px;
}

.sidebar-header {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color);
  background-color: #243d66;
}

.logo {
  height: 32px;
  width: auto;
  transition: transform 0.3s ease;
}

.sidebar-collapsed .logo {
  transform: scale(0.8);
}

/* Header styles */
.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
}

.header-logo {
  height: 32px;
  width: auto;
}

/* User dropdown styles */
.user-dropdown {
  position: relative;
}

.user-dropdown-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-1);
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-dropdown-button:hover {
  background: var(--surface-2);
}

.user-dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  min-width: 200px;
  background: var(--card-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  z-index: 50;
}

.user-info {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-info strong {
  color: var(--text-1);
}

.user-info span {
  color: var(--text-2);
  font-size: 0.875rem;
}

.dropdown-divider {
  height: 1px;
  background: var(--border-color);
  margin: 0.5rem 0;
}

/* Rest of existing styles */
.collapse-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.collapse-btn:hover {
  color: #ffffff;
  background: #3a5d8f;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4) var(--space-3);
}

.nav-item {
  display: flex;
  align-items: center;
  padding: var(--space-3) var(--space-4);
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  border-radius: var(--radius-md);
  margin-bottom: var(--space-2);
  transition: all 0.2s ease;
  font-weight: 500;
}

.nav-item i {
  margin-right: var(--space-4);
  width: 20px;
  text-align: center;
  font-size: 1.1rem;
}

.nav-item:hover {
  background: #3a5d8f;
  color: #ffffff;
}

.nav-item.active {
  background: #2563eb;
  color: #ffffff;
}

.sidebar-collapsed .nav-item i {
  margin-right: 0;
}

/* Dropdown styles */
.nav-item-content {
  display: flex;
  align-items: center;
  width: 100%;
}

.dropdown {
  cursor: pointer;
  flex-direction: column;
  align-items: flex-start;
}

.dropdown-icon {
  margin-left: auto;
  transition: transform 0.2s ease;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
}

.dropdown-icon.rotated {
  transform: rotate(180deg);
}

.dropdown-content {
  width: 100%;
  margin-top: var(--space-2);
  padding-left: var(--space-4);
  overflow: hidden;
  transition: all 0.3s ease;
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-open .dropdown-content {
  max-height: 200px;
  opacity: 1;
  transform: translateY(0);
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: var(--space-2) var(--space-4);
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.dropdown-item i {
  margin-right: var(--space-4);
  width: 20px;
  text-align: center;
  font-size: 1.1rem;
}

.dropdown-item:hover {
  background: #3a5d8f;
  color: #ffffff;
}

.dropdown-item.active {
  background: #2563eb;
  color: #ffffff;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: var(--space-4);
  background-color: var(--main-bg);
}

.content-body {
  flex: 1;
  overflow-y: auto;
  background: var(--card-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

/* Scrollbar styling */
.sidebar-nav::-webkit-scrollbar {
  width: 6px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: #3a5d8f;
  border-radius: 3px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.8);
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .mobile-menu-btn {
    display: flex;
  }

  .content-header {
    padding: 0.75rem 1rem;
  }

  .sidebar {
    position: fixed;
    z-index: 50;
    height: 100vh;
    transform: translateX(-100%);
  }

  .sidebar-mobile-open {
    transform: translateX(0);
  }

  .sidebar-overlay {
    display: block;
  }

  .main-content {
    padding: var(--space-3);
  }
}

/* Dark mode overrides */
@media (prefers-color-scheme: dark) {
  .content-header,
  .content-body {
    background: var(--surface-2);
  }

  .user-dropdown-menu {
    background: var(--surface-2);
  }

  .user-dropdown-button:hover,
  .dropdown-item:hover {
    background: var(--surface-3);
  }
}
</style>