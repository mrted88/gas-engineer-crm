<template>
  <form @submit.prevent="handleSubmit" class="login-form">
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div class="form-group">
      <label for="email">Email</label>
      <input
        type="email"
        id="email"
        v-model="formData.email"
        required
        placeholder="Enter your email"
        class="form-input"
      />
    </div>

    <div class="form-group">
      <label for="password">Password</label>
      <input
        type="password"
        id="password"
        v-model="formData.password"
        required
        placeholder="Enter your password"
        class="form-input"
      />
    </div>

    <div class="form-actions">
      <button type="submit" class="submit-button" :disabled="isLoading">
        {{ isLoading ? 'Logging in...' : 'Login' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()

interface FormData {
  email: string
  password: string
}

const formData = reactive<FormData>({
  email: '',
  password: ''
})

const isLoading = ref(false)
const error = ref('')

async function handleSubmit(): Promise<void> {
  isLoading.value = true
  error.value = ''

  try {
    const response = await api.auth.login(formData.email, formData.password)
    
    // Update auth store
    authStore.setToken(response.token)
    authStore.setCurrentUser(response.user)
    
    // Redirect to dashboard or saved path
    const redirectPath = localStorage.getItem('redirectPath') || '/'
    localStorage.removeItem('redirectPath')
    await router.push(redirectPath)
  } catch (err) {
    error.value = 'Login failed. Please check your credentials.'
    console.error('Login error:', err)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-form {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
  font-size: 0.95rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition:
    border-color 0.3s ease,
    box-shadow 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.1);
}

.form-input::placeholder {
  color: #999;
}

.error-message {
  padding: 0.75rem;
  margin-bottom: 1rem;
  color: #dc3545;
  background-color: #ffe6e6;
  border: 1px solid #ffcccc;
  border-radius: 4px;
  font-size: 0.9rem;
}

.form-actions {
  margin-top: 2rem;
}

.submit-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-button:hover {
  background-color: #3aa876;
}

.submit-button:disabled {
  background-color: #a8d5c2;
  cursor: not-allowed;
}

.submit-button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.4);
}

@media (max-width: 768px) {
  .login-form {
    margin: 1rem;
    padding: 1.5rem;
  }
}
</style>
