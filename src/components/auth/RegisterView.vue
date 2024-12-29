<template>
  <div class="auth-container">
    <div class="auth-card" data-aos="fade-up">
      <h1>Create Account</h1>
      <p class="auth-subtitle">Start managing your business today</p>
      
      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-row" data-aos="fade-up" data-aos-delay="100">
          <div class="form-group">
            <label for="firstName">First Name</label>
            <input 
              type="text" 
              id="firstName" 
              v-model="firstName"
              required
            >
          </div>
          <div class="form-group">
            <label for="lastName">Last Name</label>
            <input 
              type="text" 
              id="lastName" 
              v-model="lastName"
              required
            >
          </div>
        </div>

        <div class="form-group" data-aos="fade-up" data-aos-delay="200">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email"
            required
          >
        </div>

        <div class="form-group" data-aos="fade-up" data-aos-delay="300">
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
          <div class="password-strength" v-if="password">
            <div 
              class="strength-bar" 
              :style="{ width: `${passwordStrength}%` }"
              :class="strengthClass"
            ></div>
            <span class="strength-text">{{ strengthText }}</span>
          </div>
        </div>

        <div class="form-group terms" data-aos="fade-up" data-aos-delay="400">
          <label class="checkbox-label">
            <input type="checkbox" v-model="acceptTerms" required>
            <span>I accept the <a href="#" @click.prevent="showTerms">Terms of Service</a> and <a href="#" @click.prevent="showPrivacy">Privacy Policy</a></span>
          </label>
        </div>

        <button 
          type="submit" 
          class="btn btn-primary" 
          :disabled="isLoading || !acceptTerms"
          data-aos="fade-up" 
          data-aos-delay="500"
        >
          <span v-if="isLoading" class="loader"></span>
          <span v-else>Create Account</span>
        </button>
      </form>

      <div class="auth-footer" data-aos="fade-up" data-aos-delay="600">
        <p>Already have an account? 
          <router-link to="/login">Log in</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const acceptTerms = ref(false)
const isLoading = ref(false)

// Password strength calculation
const passwordStrength = computed(() => {
  if (!password.value) return 0
  let strength = 0
  
  // Length check
  if (password.value.length >= 8) strength += 25
  
  // Contains number
  if (/\d/.test(password.value)) strength += 25
  
  // Contains lowercase
  if (/[a-z]/.test(password.value)) strength += 25
  
  // Contains uppercase
  if (/[A-Z]/.test(password.value)) strength += 25
  
  return strength
})

const strengthClass = computed(() => {
  if (passwordStrength.value <= 25) return 'weak'
  if (passwordStrength.value <= 50) return 'medium'
  if (passwordStrength.value <= 75) return 'good'
  return 'strong'
})

const strengthText = computed(() => {
  if (passwordStrength.value <= 25) return 'Weak'
  if (passwordStrength.value <= 50) return 'Medium'
  if (passwordStrength.value <= 75) return 'Good'
  return 'Strong'
})

const handleRegister = async () => {
  try {
    isLoading.value = true
    // Add your registration logic here
    await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate API call
    router.push('/dashboard')
  } catch (error) {
    console.error('Registration failed:', error)
  } finally {
    isLoading.value = false
  }
}

const showTerms = () => {
  // Implement terms modal
  console.log('Show terms')
}

const showPrivacy = () => {
  // Implement privacy modal
  console.log('Show privacy')
}
</script>

<style scoped>
/* Include the same auth-container and auth-card styles from LoginView */

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.password-strength {
  margin-top: var(--space-2);
}

.strength-bar {
  height: 4px;
  background-color: var(--error);
  border-radius: var(--radius-full);
  transition: all 0.3s ease;
}

.strength-bar.weak { background-color: var(--error); }
.strength-bar.medium { background-color: var(--warning); }
.strength-bar.good { background-color: var(--primary-orange); }
.strength-bar.strong { background-color: var(--success); }

.strength-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: var(--space-1);
  display: block;
}

.terms {
  margin-top: var(--space-4);
}

.terms a {
  color: var(--primary-blue);
  text-decoration: none;
}

.terms a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>