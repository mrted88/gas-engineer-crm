<template>
  <form @submit.prevent="handleSubmit" class="login-form">
    <h2>Login</h2>

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

<script lang="ts">
import { defineComponent } from '@vue/runtime-core'
import { useRouter } from 'vue-router'
import { authService } from '@/services'

export default defineComponent({
  name: 'LoginForm',
  setup() {
    const router = useRouter()
    return { router }
  },
  data() {
    return {
      formData: {
        email: '',
        password: '',
      },
      isLoading: false,
      error: '',
    }
  },
  methods: {
    async handleSubmit() {
      this.isLoading = true
      this.error = ''

      try {
        const response = await authService.login(this.formData)
        console.log('Login successful:', response)

        // Store the token
        localStorage.setItem('token', response.token)

        // Redirect to customers page
        this.router.push('/customers')
      } catch (err) {
        this.error = 'Login failed. Please check your credentials.'
        console.error('Login error:', err)
      } finally {
        this.isLoading = false
      }
    },
  },
})
</script>

<style scoped>
.login-form {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-bottom: 1.5rem;
  text-align: center;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-input:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.1);
}

.error-message {
  padding: 0.75rem;
  margin-bottom: 1rem;
  color: #dc3545;
  background-color: #ffe6e6;
  border: 1px solid #ffcccc;
  border-radius: 4px;
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
}

.submit-button:hover {
  background-color: #3aa876;
}

.submit-button:disabled {
  background-color: #a8d5c2;
  cursor: not-allowed;
}
</style>
