<template>
  <div class="auth-container">
    <div class="auth-card" data-aos="fade-up">
      <h1>Welcome Back</h1>
      <p class="auth-subtitle">Log in to your account</p>
      
      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group" data-aos="fade-up" data-aos-delay="100">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email"
            required
            autocomplete="email"
          >
        </div>

        <div class="form-group" data-aos="fade-up" data-aos-delay="200">
          <label for="password">Password</label>
          <div class="password-input">
            <input 
              :type="showPassword ? 'text' : 'password'"
              id="password" 
              v-model="password"
              required
            >
            <button 
              type="button" 
              class="password-toggle"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
        </div>

        <div class="form-options" data-aos="fade-up" data-aos-delay="300">
          <label class="checkbox-label">
            <input type="checkbox" v-model="rememberMe">
            <span>Remember me</span>
          </label>
          <router-link to="/forgot-password" class="forgot-password">
            Forgot Password?
          </router-link>
        </div>

        <button 
          type="submit" 
          class="btn btn-primary" 
          :disabled="isLoading"
          data-aos="fade-up" 
          data-aos-delay="400"
        >
          <span v-if="isLoading" class="loader"></span>
          <span v-else>Log In</span>
        </button>
      </form>

      <div class="auth-footer" data-aos="fade-up" data-aos-delay="500">
        <p>Don't have an account? 
          <router-link to="/register">Sign up</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)
const isLoading = ref(false)

const handleLogin = async () => {
  try {
    isLoading.value = true
    
    // Use the auth store to login
    await authStore.login({
      email: email.value,
      password: password.value
    })

    // Handle remember me
    if (rememberMe.value) {
      localStorage.setItem('rememberMe', 'true')
    }

    // If we get here, login was successful
    router.push('/dashboard')
  } catch (error) {
    console.error('Login failed:', error)
    // You might want to show an error message to the user here
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  background: linear-gradient(135deg, var(--blue-50) 0%, var(--blue-100) 100%);
}

.auth-card {
  background: var(--bg-primary);
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.auth-card h1 {
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.auth-subtitle {
  color: var(--text-secondary);
  margin-bottom: var(--space-4);
}

.auth-form {
  text-align: left;
}

.form-group {
  margin-bottom: var(--space-4);
}

.form-group label {
  display: block;
  margin-bottom: var(--space-2);
  color: var(--text-primary);
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: var(--space-2);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-md);
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-blue);
}

.password-input {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: var(--space-2);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-1);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
}

.forgot-password {
  color: var(--primary-blue);
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

.auth-footer {
  margin-top: var(--space-4);
  color: var(--text-secondary);
}

.auth-footer a {
  color: var(--primary-blue);
  text-decoration: none;
}

.auth-footer a:hover {
  text-decoration: underline;
}

.loader {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid var(--text-white);
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .auth-card {
    padding: var(--space-4);
  }

  .form-options {
    flex-direction: column;
    gap: var(--space-3);
    align-items: flex-start;
  }
}
</style>