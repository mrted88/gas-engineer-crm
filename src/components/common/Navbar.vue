<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <h1>Gas Engineer CRM</h1>
    </div>
    <div class="navbar-menu">
      <router-link to="/" class="nav-link" active-class="active">Home</router-link>
      <router-link to="/customers" class="nav-link" active-class="active">Customers</router-link>
      <router-link to="/diary" class="nav-link" active-class="active">Calendar</router-link>
      <router-link to="/settings" class="nav-link" active-class="active">Settings</router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<style scoped>
.navbar {
  padding: 1rem 2rem;
  background-color: #2c3e50;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.navbar-brand h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.navbar-menu {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  color: #ffffff;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.nav-link:hover {
  color: #42b983;
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-link.active {
  color: #42b983;
  background-color: rgba(66, 185, 131, 0.1);
}

/* Responsive Design */
@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    padding: 1rem;
  }

  .navbar-brand {
    margin-bottom: 1rem;
  }

  .navbar-menu {
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  .nav-link {
    width: 100%;
    text-align: center;
  }
}
</style>