<template>
    <nav class="navbar">
      <div class="nav-container">
        <router-link to="/" class="nav-brand">
          <img src="@/assets/logo.svg" alt="OpenBook CRM" class="nav-logo">
          <span>OpenBook CRM</span>
        </router-link>
  
        <!-- Main Navigation -->
        <div class="nav-links" :class="{ active: isMenuOpen }">
          <template v-if="isAuthenticated">
            <router-link to="/dashboard" class="nav-link">
              <i class="fas fa-chart-line"></i>
              Dashboard
            </router-link>
            <router-link to="/customers" class="nav-link">
              <i class="fas fa-users"></i>
              Customers
            </router-link>
          </template>
        </div>
  
        <!-- Auth Buttons -->
        <div class="nav-auth">
          <template v-if="isAuthenticated">
            <div class="user-menu" v-click-outside="closeUserMenu">
              <button class="user-button" @click="toggleUserMenu">
                <div class="user-avatar">{{ userInitials }}</div>
                <span class="user-name">{{ userName }}</span>
                <i class="fas fa-chevron-down"></i>
              </button>
              
              <div v-if="showUserMenu" class="dropdown-menu">
                <router-link to="/profile" class="dropdown-item">
                  <i class="fas fa-user"></i>
                  Profile
                </router-link>
                <router-link to="/settings" class="dropdown-item">
                  <i class="fas fa-cog"></i>
                  Settings
                </router-link>
                <button @click="handleLogout" class="dropdown-item text-error">
                  <i class="fas fa-sign-out-alt"></i>
                  Logout
                </button>
              </div>
            </div>
          </template>
          <template v-else>
            <router-link to="/login" class="btn btn-secondary">Login</router-link>
            <router-link to="/register" class="btn btn-primary">Get Started</router-link>
          </template>
        </div>
  
        <!-- Mobile Menu Button -->
        <button class="mobile-menu-btn" @click="toggleMenu">
          <i class="fas" :class="isMenuOpen ? 'fa-times' : 'fa-bars'"></i>
        </button>
      </div>
    </nav>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'
  
  const router = useRouter()
  const authStore = useAuthStore()
  
  const isMenuOpen = ref(false)
  const showUserMenu = ref(false)
  
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const userName = computed(() => authStore.user?.name || 'User')
  const userInitials = computed(() => {
    const name = authStore.user?.name || ''
    return name.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  })
  
  const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value
  }
  
  const toggleUserMenu = () => {
    showUserMenu.value = !showUserMenu.value
  }
  
  const closeUserMenu = () => {
    showUserMenu.value = false
  }
  
  const handleLogout = async () => {
    await authStore.logout()
    router.push('/login')
  }
  </script>
  
  <style scoped>
  .navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: var(--bg-primary);
    box-shadow: var(--shadow-sm);
    z-index: 100;
  }
  
  .nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--space-4);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .nav-brand {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    text-decoration: none;
    color: var(--text-primary);
    font-weight: 600;
    font-size: 1.25rem;
  }
  
  .nav-logo {
    height: 32px;
  }
  
  .nav-links {
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }
  
  .nav-link {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    text-decoration: none;
    color: var(--text-secondary);
    transition: color 0.3s ease;
  }
  
  .nav-link:hover,
  .nav-link.router-link-active {
    color: var(--primary-blue);
  }
  
  .nav-auth {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }
  
  .user-menu {
    position: relative;
  }
  
  .user-button {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2);
    border: none;
    background: none;
    cursor: pointer;
  }
  
  .user-avatar {
    width: 32px;
    height: 32px;
    background: var(--primary-blue);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
  }
  
  .dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background: var(--bg-primary);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    min-width: 200px;
    margin-top: var(--space-2);
  }
  
  .dropdown-item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    color: var(--text-primary);
    text-decoration: none;
    transition: background-color 0.3s ease;
  }
  
  .dropdown-item:hover {
    background-color: var(--bg-secondary);
  }
  
  .mobile-menu-btn {
    display: none;
    padding: var(--space-2);
    border: none;
    background: none;
    cursor: pointer;
    color: var(--text-primary);
  }
  
  @media (max-width: 768px) {
    .nav-links {
      display: none;
    }
  
    .nav-links.active {
      display: flex;
      flex-direction: column;
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: var(--bg-primary);
      padding: var(--space-4);
      box-shadow: var(--shadow-md);
    }
  
    .mobile-menu-btn {
      display: block;
    }
  
    .nav-auth .btn {
      display: none;
    }
  }
  </style>