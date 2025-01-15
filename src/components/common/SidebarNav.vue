<template>
  <aside class="sidebar-nav">
    <nav class="sidebar-navigation">
      <ul class="nav-list">
        <li class="nav-item">
          <router-link to="/dashboard/diary" class="nav-link">
            <span class="nav-icon">📅</span>
            <span class="nav-text">Diary</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/dashboard/customers" class="nav-link">
            <span class="nav-icon">👥</span>
            <span class="nav-text">Customers</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/dashboard/quotes" class="nav-link">
            <span class="nav-icon">💬</span>
            <span class="nav-text">Quotes</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/dashboard/inventory" class="nav-link">
            <span class="nav-icon">📦</span>
            <span class="nav-text">Inventory</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/dashboard/reports" class="nav-link">
            <span class="nav-icon">📊</span>
            <span class="nav-text">Reports</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/dashboard/accounts" class="nav-link">
            <span class="nav-icon">💼</span>
            <span class="nav-text">Accounts</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/dashboard/settings" class="nav-link">
            <span class="nav-icon">⚙️</span>
            <span class="nav-text">Settings</span>
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<style scoped>
.sidebar-nav {
  width: 250px;
  height: 100vh;
  background-color: #2c3e50;
  color: white;
  padding: 1rem;
  position: fixed;
  left: 0;
  top: 0;
}

.sidebar-navigation {
  margin-top: 2rem;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin-bottom: 0.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-link.router-link-active {
  background-color: #42b983;
}

.nav-icon {
  margin-right: 0.75rem;
  font-size: 1.2rem;
}

.nav-text {
  font-size: 1rem;
}

@media (max-width: 768px) {
  .sidebar-nav {
    width: 100%;
    height: auto;
    position: relative;
    padding: 0.5rem;
  }

  .nav-list {
    display: flex;
    justify-content: space-around;
  }

  .nav-item {
    margin-bottom: 0;
  }

  .nav-link {
    flex-direction: column;
    align-items: center;
    padding: 0.5rem;
  }

  .nav-icon {
    margin-right: 0;
    margin-bottom: 0.25rem;
  }

  .nav-text {
    font-size: 0.8rem;
  }
}
</style>