<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="navbar-brand">
        <router-link to="/" class="brand">OpenBook CRM</router-link>
        <button class="hamburger" @click="toggleMenu" :class="{ 'is-active': isMenuOpen }">
          <span class="hamburger-box">
            <span class="hamburger-inner"></span>
          </span>
        </button>
      </div>
      
      <div class="navbar-menu" :class="{ 'is-open': isMenuOpen }">
        <router-link to="/" class="nav-link" @click="closeMenu">Home</router-link>
        <router-link to="/customers" class="nav-link" @click="closeMenu">Customers</router-link>
        <router-link 
          to="/login" 
          class="nav-link btn btn-primary" 
          v-if="!isLoggedIn"
          @click="closeMenu"
        >Login</router-link>
        <button 
          @click="handleLogout" 
          class="nav-link btn btn-secondary" 
          v-if="isLoggedIn"
        >Logout</button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLoggedIn = ref(false)
const isMenuOpen = ref(false)

onMounted(() => {
  isLoggedIn.value = !!localStorage.getItem('token')
})

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
  if (isMenuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const closeMenu = () => {
  isMenuOpen.value = false
  document.body.style.overflow = ''
}

const handleLogout = () => {
  localStorage.removeItem('token')
  isLoggedIn.value = false
  closeMenu()
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  background-color: var(--bg-primary);
  box-shadow: var(--shadow-md);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-3) var(--space-4);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-brand {
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.brand {
  color: var(--primary-blue);
  text-decoration: none;
  transition: color 0.3s ease;
}

.brand:hover {
  color: var(--blue-700);
}

.navbar-menu {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.nav-link {
  color: var(--text-primary);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
}

.nav-link:not(.btn):hover {
  color: var(--primary-blue);
  background-color: var(--blue-50);
}

.router-link-active:not(.btn) {
  color: var(--primary-blue);
  background-color: var(--blue-50);
}

button.nav-link {
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

/* Hamburger Menu */
.hamburger {
  display: none;
  padding: var(--space-2);
  background: none;
  border: none;
  cursor: pointer;
}

.hamburger-box {
  width: 24px;
  height: 24px;
  display: inline-block;
  position: relative;
}

.hamburger-inner {
  display: block;
  top: 50%;
  margin-top: -2px;
}

.hamburger-inner, .hamburger-inner::before, .hamburger-inner::after {
  width: 24px;
  height: 2px;
  background-color: var(--primary-blue);
  position: absolute;
  transition: transform 0.15s ease;
}

.hamburger-inner::before, .hamburger-inner::after {
  content: "";
  display: block;
}

.hamburger-inner::before {
  top: -8px;
}

.hamburger-inner::after {
  bottom: -8px;
}

/* Hamburger Animation */
.hamburger.is-active .hamburger-inner {
  transform: rotate(45deg);
}

.hamburger.is-active .hamburger-inner::before {
  top: 0;
  opacity: 0;
}

.hamburger.is-active .hamburger-inner::after {
  bottom: 0;
  transform: rotate(-90deg);
}

@media (max-width: 768px) {
  .hamburger {
    display: block;
  }

  .navbar-container {
    padding: var(--space-2) var(--space-3);
  }

  .navbar-brand {
    width: 100%;
    justify-content: space-between;
  }

  .navbar-menu {
    display: flex;
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    background-color: var(--bg-primary);
    flex-direction: column;
    padding: var(--space-4);
    gap: var(--space-3);
    box-shadow: var(--shadow-md);
    height: calc(100vh - 64px);
    transform: translateX(100%);
    transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
    opacity: 0;
  }

  .navbar-menu.is-open {
    transform: translateX(0);
    opacity: 1;
  }

  .nav-link {
    width: 100%;
    text-align: center;
    padding: var(--space-3);
  }

  .btn {
    width: 100%;
  }
}
</style>