<template>
  <div class="register-form">
    <h2>Register</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="username">Username</label>
        <input
          id="username"
          v-model="formData.username"
          type="text"
          required
          placeholder="Choose a username"
        />
      </div>

      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          v-model="formData.email"
          type="email"
          required
          placeholder="Enter your email"
        />
      </div>

      <div class="form-group">
        <label for="firstName">First Name</label>
        <input
          id="firstName"
          v-model="formData.firstName"
          type="text"
          required
          placeholder="Enter your first name"
        />
      </div>

      <div class="form-group">
        <label for="lastName">Last Name</label>
        <input
          id="lastName"
          v-model="formData.lastName"
          type="text"
          required
          placeholder="Enter your last name"
        />
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input
          id="password"
          v-model="formData.password"
          type="password"
          required
          placeholder="Choose a password"
        />
      </div>

      <div class="form-group">
        <label for="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          v-model="formData.confirmPassword"
          type="password"
          required
          placeholder="Confirm your password"
        />
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <button type="submit" :disabled="isLoading || !isFormValid">
        {{ isLoading ? 'Registering...' : 'Register' }}
      </button>

      <div class="links">
        <router-link to="/login">Already have an account? Login</router-link>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from '@vue/runtime-core'
import { useRouter } from 'vue-router'

interface FormData {
  username: string
  email: string
  firstName: string
  lastName: string
  password: string
  confirmPassword: string
}

const router = useRouter()
const isLoading = ref(false)
const error = ref('')

const formData = reactive<FormData>({
  username: '',
  email: '',
  firstName: '',
  lastName: '',
  password: '',
  confirmPassword: '',
})

const isFormValid = computed(() => {
  return (
    formData.username &&
    formData.email &&
    formData.firstName &&
    formData.lastName &&
    formData.password &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword
  )
})

const handleSubmit = async () => {
  if (!isFormValid.value) {
    error.value = 'Please fill in all fields and make sure passwords match'
    return
  }

  try {
    isLoading.value = true
    error.value = ''

    // TODO: Implement registration logic
    console.log('Registration attempt:', {
      username: formData.username,
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      password: formData.password,
    })

    // After successful registration
    router.push('/login')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.register-form {
  background: var(--surface);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: var(--shadow);
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: var(--primary-blue);
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

input:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--primary-orange);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: var(--orange-dark);
}

button:disabled {
  background-color: var(--border-color);
  cursor: not-allowed;
}

.error-message {
  color: var(--error);
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.links {
  text-align: center;
  margin-top: 1rem;
}

a {
  color: var(--primary-blue);
  text-decoration: none;
  transition: color 0.3s ease;
}

a:hover {
  color: var(--blue-dark);
  text-decoration: underline;
}
</style>
